import { escapeHtml } from '../../common/html-escape';
import { detailsTable, emailLayout, formatMoney } from './layout';

export function paymentReceiptTemplate(payment: {
  orderNumber: string;
  amount: number;
}): string {
  return emailLayout({
    preheader: `Payment of ${formatMoney(payment.amount)} received.`,
    heading: 'Payment received',
    body: `<p style="margin:0;">Thank you. We've received your payment and your order is now being processed.</p>
      ${detailsTable([
        ['Order number', `#${escapeHtml(payment.orderNumber)}`],
        ['Amount charged', formatMoney(payment.amount)],
      ])}`,
  });
}
