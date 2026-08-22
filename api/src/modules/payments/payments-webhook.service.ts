import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { Prisma } from '@generated/prisma/client';
import { OrderStatus, PaymentStatus } from '@generated/prisma/enums';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class PaymentsWebhookService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(PaymentsWebhookService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not configured',
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new InternalServerErrorException(
        'STRIPE_WEBHOOK_SECRET is not configured',
      );
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  }

  async handleWebhook(
    signature: string,
    rawBody: Buffer,
  ): Promise<{ received: boolean }> {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        this.webhookSecret,
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Invalid signature';
      throw new BadRequestException(
        `Webhook signature verification failed: ${message}`,
      );
    }

    try {
      await this.prisma.webhookEvent.create({
        data: { stripeEventId: event.id, type: event.type },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        this.logger.log(`Duplicate webhook event ${event.id} ignored`);
        return { received: true };
      }

      throw error;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object;
          if (
            session.payment_status === 'paid' &&
            typeof session.payment_intent === 'string'
          ) {
            await this.applySucceeded(session.id, session.payment_intent);
          }
          break;
        }
        case 'checkout.session.expired':
          await this.applyFailed(event.data.object.id);
          break;
        default:
          this.logger.log(`Unhandled Stripe event type: ${event.type}`);
      }
    } catch (error) {
      await this.prisma.webhookEvent.delete({
        where: { stripeEventId: event.id },
      });

      throw error;
    }

    return { received: true };
  }

  async applySucceeded(
    sessionId: string,
    paymentIntentId: string,
  ): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: sessionId },
    });

    if (!payment) {
      this.logger.warn(
        `Received checkout.session.completed for unknown session ${sessionId}`,
      );
      return;
    }

    const order = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.payment.updateMany({
        where: { id: payment.id, status: PaymentStatus.PENDING },
        // Swap the tracked id for the real PaymentIntent now that it
        // exists — refunds need a PaymentIntent id, not a Session id.
        data: {
          status: PaymentStatus.COMPLETED,
          transactionId: paymentIntentId,
        },
      });

      if (count !== 1) {
        return null;
      }

      return await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PROCESSING },
        include: { user: true },
      });
    });

    if (!order) {
      return;
    }

    await this.emailService.sendPaymentReceiptEmail(order.user.email, {
      orderNumber: order.orderNumber,
      amount: Number(payment.amount),
    });
  }

  async applyFailed(sessionId: string): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: sessionId },
    });

    if (!payment) {
      this.logger.warn(
        `Received checkout.session.expired for unknown session ${sessionId}`,
      );
      return;
    }

    await this.prisma.payment.updateMany({
      where: { id: payment.id, status: PaymentStatus.PENDING },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
