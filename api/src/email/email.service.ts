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
} from './templates';

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
    order: { orderNumber: string; totalAmount: number },
  ): Promise<void> {
    await this.send(
      to,
      `Order confirmation — #${order.orderNumber}`,
      orderConfirmationTemplate(order),
    );
  }

  async sendPaymentReceiptEmail(
    to: string,
    payment: { orderNumber: string; amount: number },
  ): Promise<void> {
    await this.send(
      to,
      `Payment received — Order #${payment.orderNumber}`,
      paymentReceiptTemplate(payment),
    );
  }

  async sendRefundConfirmationEmail(
    to: string,
    payment: { orderNumber: string; amount: number },
  ): Promise<void> {
    await this.send(
      to,
      `Refund processed — Order #${payment.orderNumber}`,
      refundConfirmationTemplate(payment),
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
      `Order #${order.orderNumber} update: ${order.status}`,
      orderStatusUpdateTemplate(order),
    );
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
