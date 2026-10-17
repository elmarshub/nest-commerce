import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Resend } from 'resend';
import {
  passwordResetTemplate,
  emailVerificationTemplate,
  orderConfirmationTemplate,
  paymentReceiptTemplate,
  refundConfirmationTemplate,
  orderStatusUpdateTemplate,
  reviewRequestTemplate,
} from './templates';
import type { EmailItem } from './templates/layout';

/** Readable order reference for emails: the last 8 characters of the id, uppercased. */
export function shortOrderNumber(orderNumber: string): string {
  return orderNumber.slice(-8).toUpperCase();
}

export interface EmailOrderItem {
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  private readonly frontendUrl: string;
  private readonly logger = new Logger(EmailService.name);

  constructor() {
    if (!process.env.RESEND_API_KEY) {
      throw new InternalServerErrorException(
        'RESEND_API_KEY is not configured',
      );
    }

    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'onboarding@resend.dev';
    this.frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000';
  }

  async sendPasswordResetEmail(to: string, rawToken: string): Promise<void> {
    const resetLink = `${this.frontendUrl}/reset-password?token=${rawToken}`;

    await this.send(
      to,
      'Reset your password',
      passwordResetTemplate(resetLink),
    );
  }

  async sendEmailVerificationEmail(
    to: string,
    rawToken: string,
  ): Promise<void> {
    const verifyLink = `${this.frontendUrl}/verify-email?token=${rawToken}`;

    await this.send(
      to,
      'Verify your email address',
      emailVerificationTemplate(verifyLink),
    );
  }

  async sendOrderConfirmationEmail(
    to: string,
    order: {
      orderNumber: string;
      totalAmount: number;
      items?: EmailOrderItem[];
      shippingAddress?: string | null;
    },
  ): Promise<void> {
    await this.send(
      to,
      `Order confirmation — #${shortOrderNumber(order.orderNumber)}`,
      orderConfirmationTemplate({
        ...order,
        orderNumber: shortOrderNumber(order.orderNumber),
        items: this.toEmailItems(order.items),
        orderUrl: this.accountUrl,
        shopUrl: this.frontendUrl,
      }),
    );
  }

  async sendPaymentReceiptEmail(
    to: string,
    payment: {
      orderNumber: string;
      amount: number;
      items?: EmailOrderItem[];
    },
  ): Promise<void> {
    await this.send(
      to,
      `Payment received — Order #${shortOrderNumber(payment.orderNumber)}`,
      paymentReceiptTemplate({
        ...payment,
        orderNumber: shortOrderNumber(payment.orderNumber),
        items: this.toEmailItems(payment.items),
        orderUrl: this.accountUrl,
        shopUrl: this.frontendUrl,
      }),
    );
  }

  async sendRefundConfirmationEmail(
    to: string,
    payment: { orderNumber: string; amount: number },
  ): Promise<void> {
    await this.send(
      to,
      `Refund processed — Order #${shortOrderNumber(payment.orderNumber)}`,
      refundConfirmationTemplate({
        ...payment,
        orderNumber: shortOrderNumber(payment.orderNumber),
        shopUrl: this.frontendUrl,
      }),
    );
  }

  async sendOrderStatusUpdateEmail(
    to: string,
    order: {
      orderNumber: string;
      status: string;
      trackingNumber?: string | null;
    },
  ): Promise<void> {
    await this.send(
      to,
      `Order #${shortOrderNumber(order.orderNumber)} update: ${order.status}`,
      orderStatusUpdateTemplate({
        ...order,
        orderNumber: shortOrderNumber(order.orderNumber),
        orderUrl: this.accountUrl,
        shopUrl: this.frontendUrl,
      }),
    );
  }

  async sendReviewRequestEmail(
    to: string,
    order: { orderNumber: string; items: { productName: string }[] },
  ): Promise<void> {
    await this.send(
      to,
      `How was your order? — #${shortOrderNumber(order.orderNumber)}`,
      reviewRequestTemplate({
        orderNumber: shortOrderNumber(order.orderNumber),
        items: order.items,
        accountUrl: this.accountUrl,
        shopUrl: this.frontendUrl,
      }),
    );
  }

  private get accountUrl(): string {
    return `${this.frontendUrl}/account`;
  }

  // product images may be stored as paths relative to the storefront
  private toEmailItems(items: EmailOrderItem[] = []): EmailItem[] {
    return items.map((item) => ({
      ...item,
      imageUrl: item.imageUrl
        ? /^https?:\/\//.test(item.imageUrl)
          ? item.imageUrl
          : `${this.frontendUrl}${item.imageUrl.startsWith('/') ? '' : '/'}${item.imageUrl}`
        : null,
    }));
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    try {
      const { error } = await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Failed to send email to ${to}: ${error.message}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Failed to send email to ${to}: ${message}`);
    }
  }
}
