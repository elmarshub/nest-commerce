import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { Payment, Prisma } from '@generated/prisma/client';
import { OrderStatus, PaymentStatus, Role } from '@generated/prisma/enums';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import Stripe from 'stripe';
import { randomUUID } from 'crypto';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { CheckoutSessionResponseDto } from './dto/checkout-session-response.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { QueryPaymentDto } from './dto/query-payment.dto';
import { PaginatedPaymentsResponseDto } from './dto/paginated-payments-response.dto';
import { PaymentsWebhookService } from './payments-webhook.service';

@Injectable()
export class PaymentsService {
  private readonly stripe: Stripe;
  private readonly frontendUrl: string;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private paymentsWebhookService: PaymentsWebhookService,
  ) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new InternalServerErrorException(
        'STRIPE_SECRET_KEY is not configured',
      );
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    this.frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  }

  async createCheckoutSession(
    userId: string,
    { orderId }: CreateCheckoutSessionDto,
  ): Promise<CheckoutSessionResponseDto> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        payment: true,
        user: true,
        orderItems: { include: { product: true } },
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('This order does not belong to you');
    }

    if (order.payment?.status === PaymentStatus.COMPLETED) {
      throw new ConflictException('This order has already been paid');
    }

    const currency = order.payment?.currency ?? 'usd';

    const canReuseKey =
      order.payment?.stripeIdempotencyKey &&
      order.payment.status === PaymentStatus.PENDING &&
      order.payment.currency === currency;

    const idempotencyKey = canReuseKey
      ? order.payment!.stripeIdempotencyKey!
      : randomUUID();

    const session = await this.stripe.checkout.sessions.create(
      {
        mode: 'payment',
        client_reference_id: order.id,
        customer_email: order.user.email,
        line_items: order.orderItems.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency,
            unit_amount: Math.round(Number(item.price) * 100),
            product_data: {
              name: item.product.name,
              images: item.product.imageUrl
                ? [item.product.imageUrl]
                : undefined,
              metadata: { productId: item.productId },
            },
          },
        })),
        metadata: { orderId: order.id, userId },
        success_url: `${this.frontendUrl}/order-success?orderId=${order.id}`,
        cancel_url: `${this.frontendUrl}/checkout?payment=cancelled`,
      },
      { idempotencyKey },
    );

    if (!session.url) {
      throw new InternalServerErrorException(
        'Failed to create checkout session',
      );
    }

    const payment = await this.prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        userId,
        amount: order.totalAmount,
        status: PaymentStatus.PENDING,
        transactionId: session.id,
        stripeIdempotencyKey: idempotencyKey,
      },
      update: {
        status: PaymentStatus.PENDING,
        transactionId: session.id,
        stripeIdempotencyKey: idempotencyKey,
      },
    });

    return {
      url: session.url,
      payment: this.formatPayment(payment),
    };
  }

  async findOne(
    userId: string,
    role: Role,
    id: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('This payment does not belong to you');
    }

    return this.formatPayment(payment);
  }

  async findByOrderId(
    userId: string,
    role: Role,
    orderId: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found for this order');
    }

    if (payment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('This payment does not belong to you');
    }

    return this.formatPayment(payment);
  }

  async syncPayment(
    userId: string,
    role: Role,
    id: string,
  ): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('This payment does not belong to you');
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return this.formatPayment(payment);
    }

    if (!payment.transactionId) {
      return this.formatPayment(payment);
    }

    const session = await this.stripe.checkout.sessions.retrieve(
      payment.transactionId,
    );

    if (
      session.payment_status === 'paid' &&
      typeof session.payment_intent === 'string'
    ) {
      await this.paymentsWebhookService.applySucceeded(
        session.id,
        session.payment_intent,
      );
    } else if (session.status === 'expired') {
      await this.paymentsWebhookService.applyFailed(session.id);
    }

    const refreshed = await this.prisma.payment.findUniqueOrThrow({
      where: { id },
    });

    return this.formatPayment(refreshed);
  }

  async refund(id: string): Promise<PaymentResponseDto> {
    const payment = await this.prisma.payment.findUnique({ where: { id } });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        `Cannot refund a payment with status "${payment.status}"`,
      );
    }

    if (!payment.transactionId) {
      throw new InternalServerErrorException(
        'Payment has no associated transaction to refund',
      );
    }

    await this.stripe.refunds.create(
      { payment_intent: payment.transactionId },
      { idempotencyKey: `refund-${payment.id}` },
    );

    const { updated, orderUserEmail, orderNumber } =
      await this.prisma.$transaction(async (tx) => {
        const { count } = await tx.payment.updateMany({
          where: { id, status: PaymentStatus.COMPLETED },
          data: { status: PaymentStatus.REFUNDED },
        });

        if (count !== 1) {
          throw new ConflictException(
            'This payment was already refunded or its status changed concurrently',
          );
        }

        const order = await tx.order.findUnique({
          where: { id: payment.orderId },
          include: { orderItems: true, user: true },
        });

        const restockableStatuses: OrderStatus[] = [
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
        ];

        if (order && restockableStatuses.includes(order.status)) {
          for (const item of order.orderItems) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stock: { increment: item.quantity } },
            });
          }

          await tx.order.update({
            where: { id: order.id },
            data: { status: OrderStatus.CANCELLED },
          });
        }

        const updatedPayment = await tx.payment.findUniqueOrThrow({
          where: { id },
        });

        return {
          updated: updatedPayment,
          orderUserEmail: order?.user.email,
          orderNumber: order?.orderNumber,
        };
      });

    if (orderUserEmail && orderNumber) {
      await this.emailService.sendRefundConfirmationEmail(orderUserEmail, {
        orderNumber,
        amount: Number(updated.amount),
      });
    }

    return this.formatPayment(updated);
  }

  async findAll(query: QueryPaymentDto): Promise<PaginatedPaymentsResponseDto> {
    const { page = 1, limit = 10, status, userId } = query;

    const where: Prisma.PaymentWhereInput = {
      ...(status && { status }),
      ...(userId && { userId }),
    };

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.payment.count({ where }),
    ]);

    return {
      data: payments.map((payment) => this.formatPayment(payment)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private formatPayment(payment: Payment) {
    return {
      id: payment.id,
      orderId: payment.orderId,
      userId: payment.userId,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }
}
