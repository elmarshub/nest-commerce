import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { Prisma } from '@generated/prisma/client';
import { PrismaService } from '@/prisma/prisma.service';
import { EmailService } from '@/email/email.service';
import { PaymentsWebhookService } from './payments-webhook.service';
import { STRIPE_CLIENT } from './stripe.provider';

describe('PaymentsWebhookService', () => {
  let service: PaymentsWebhookService;
  let constructEvent: jest.Mock;
  let prisma: {
    webhookEvent: { create: jest.Mock; delete: jest.Mock };
    payment: { findFirst: jest.Mock; updateMany: jest.Mock };
    order: { update: jest.Mock };
    $transaction: jest.Mock;
  };
  const emailService = { sendPaymentReceiptEmail: jest.fn() };
  const originalWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const sessionEvent = (
    type: string,
    object: Record<string, unknown>,
  ): Record<string, unknown> => ({
    id: 'evt_1',
    type,
    data: { object: { id: 'cs_1', ...object } },
  });

  beforeEach(async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    constructEvent = jest.fn();
    const tx = {
      payment: { updateMany: jest.fn().mockResolvedValue({ count: 1 }) },
      order: {
        update: jest.fn().mockResolvedValue({
          orderNumber: 'ORD-1',
          user: { email: 'a@b.c' },
        }),
      },
    };
    prisma = {
      webhookEvent: {
        create: jest.fn().mockResolvedValue({}),
        delete: jest.fn().mockResolvedValue({}),
      },
      payment: {
        findFirst: jest.fn().mockResolvedValue({
          id: 'pay_1',
          orderId: 'ord_1',
          amount: 25,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      },
      order: { update: jest.fn() },
      $transaction: jest.fn((cb: (t: typeof tx) => unknown) => cb(tx)),
    };
    emailService.sendPaymentReceiptEmail.mockReset();

    const module = await Test.createTestingModule({
      providers: [
        PaymentsWebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: EmailService, useValue: emailService },
        {
          provide: STRIPE_CLIENT,
          useValue: { webhooks: { constructEvent } },
        },
      ],
    }).compile();
    service = module.get(PaymentsWebhookService);
  });

  afterEach(() => {
    if (originalWebhookSecret === undefined) {
      delete process.env.STRIPE_WEBHOOK_SECRET;
    } else {
      process.env.STRIPE_WEBHOOK_SECRET = originalWebhookSecret;
    }
  });

  it('rejects an invalid signature', async () => {
    constructEvent.mockImplementation(() => {
      throw new Error('bad sig');
    });
    await expect(
      service.handleWebhook('sig', Buffer.from('{}')),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it.each([
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
  ])('marks the payment completed on %s when paid', async (type) => {
    constructEvent.mockReturnValue(
      sessionEvent(type, { payment_status: 'paid', payment_intent: 'pi_1' }),
    );
    await service.handleWebhook('sig', Buffer.from('{}'));
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(emailService.sendPaymentReceiptEmail).toHaveBeenCalledTimes(1);
  });

  it('does not fulfil an unpaid completed session (delayed method)', async () => {
    constructEvent.mockReturnValue(
      sessionEvent('checkout.session.completed', {
        payment_status: 'unpaid',
        payment_intent: 'pi_1',
      }),
    );
    await service.handleWebhook('sig', Buffer.from('{}'));
    expect(prisma.$transaction).not.toHaveBeenCalled();
    expect(emailService.sendPaymentReceiptEmail).not.toHaveBeenCalled();
  });

  it.each([
    'checkout.session.expired',
    'checkout.session.async_payment_failed',
  ])('marks the pending payment failed on %s', async (type) => {
    constructEvent.mockReturnValue(sessionEvent(type, {}));
    await service.handleWebhook('sig', Buffer.from('{}'));
    expect(prisma.payment.updateMany).toHaveBeenCalledWith({
      where: { id: 'pay_1', status: 'PENDING' },
      data: { status: 'FAILED' },
    });
  });

  it('ignores duplicate events', async () => {
    constructEvent.mockReturnValue(
      sessionEvent('checkout.session.completed', {
        payment_status: 'paid',
        payment_intent: 'pi_1',
      }),
    );
    prisma.webhookEvent.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'x',
      }),
    );
    await expect(
      service.handleWebhook('sig', Buffer.from('{}')),
    ).resolves.toEqual({ received: true });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('removes the event record when handling fails so Stripe can retry', async () => {
    constructEvent.mockReturnValue(
      sessionEvent('checkout.session.completed', {
        payment_status: 'paid',
        payment_intent: 'pi_1',
      }),
    );
    prisma.$transaction.mockRejectedValue(new Error('db down'));
    await expect(
      service.handleWebhook('sig', Buffer.from('{}')),
    ).rejects.toThrow('db down');
    expect(prisma.webhookEvent.delete).toHaveBeenCalledWith({
      where: { stripeEventId: 'evt_1' },
    });
  });
});
