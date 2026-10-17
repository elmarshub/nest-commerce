import {
  emailVerificationTemplate,
  orderConfirmationTemplate,
  orderStatusUpdateTemplate,
  passwordResetTemplate,
  paymentReceiptTemplate,
  refundConfirmationTemplate,
  reviewRequestTemplate,
} from './index';

describe('email templates', () => {
  it('renders a full html document with the link and brand', () => {
    const html = passwordResetTemplate('https://x.test/reset?token=abc');
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('href="https://x.test/reset?token=abc"');
    expect(html).toContain('Havens');
  });

  it('renders every template without throwing', () => {
    const all = [
      emailVerificationTemplate('https://x.test/v'),
      orderConfirmationTemplate({ orderNumber: 'A1', totalAmount: 12.5 }),
      paymentReceiptTemplate({ orderNumber: 'A1', amount: 12.5 }),
      refundConfirmationTemplate({ orderNumber: 'A1', amount: 12.5 }),
      orderStatusUpdateTemplate({
        orderNumber: 'A1',
        status: 'SHIPPED',
        trackingNumber: 'TRK1',
      }),
      reviewRequestTemplate({
        orderNumber: 'A1',
        items: [{ productName: 'Chair' }],
        accountUrl: 'https://x.test/account',
      }),
    ];
    all.forEach((html) => expect(html).toContain('<!DOCTYPE html>'));
  });

  it('formats money and humanises the status', () => {
    expect(
      orderConfirmationTemplate({ orderNumber: 'A1', totalAmount: 5 }),
    ).toContain('$5.00');
    const html = orderStatusUpdateTemplate({
      orderNumber: 'A1',
      status: 'SHIPPED',
    });
    expect(html).toContain('Shipped');
    expect(html).not.toContain('Tracking number');
  });

  it('escapes user-controlled values', () => {
    const html = reviewRequestTemplate({
      orderNumber: '<b>1</b>',
      items: [{ productName: '<script>alert(1)</script>' }],
      accountUrl: 'https://x.test/account',
    });
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<b>1</b>');
  });
});
