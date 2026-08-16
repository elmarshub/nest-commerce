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

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.applySucceeded(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.applyFailed(event.data.object);
        break;
      default:
        this.logger.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return { received: true };
  }

  /** Applies the effects of a successful payment intent — reused by the webhook handler and the client-triggered sync fallback. */
  async applySucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (!payment) {
      this.logger.warn(
        `Received payment_intent.succeeded for unknown transaction ${paymentIntent.id}`,
      );
      return;
    }

    const [, order] = await this.prisma.$transaction([
      this.prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.COMPLETED },
      }),
      this.prisma.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PROCESSING },
        include: { user: true },
      }),
    ]);

    await this.emailService.sendPaymentReceiptEmail(order.user.email, {
      orderNumber: order.orderNumber,
      amount: Number(payment.amount),
    });
  }

  /** Applies the effects of a failed payment intent — reused by the webhook handler and the client-triggered sync fallback. */
  async applyFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: { transactionId: paymentIntent.id },
    });

    if (!payment) {
      this.logger.warn(
        `Received payment_intent.payment_failed for unknown transaction ${paymentIntent.id}`,
      );
      return;
    }

    await this.prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
  }
}
