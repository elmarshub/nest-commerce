import { escapeHtml } from '../../common/html-escape';
import { detailsTable, emailLayout, formatMoney } from './layout';

export function refundConfirmationTemplate(payment: {
  orderNumber: string;
  amount: number;
}): string {
  return emailLayout({
    preheader: `Your refund of ${formatMoney(payment.amount)} is on its way.`,
    heading: 'Your refund has been processed',
    body: `<p style="margin:0;">We've refunded your payment. It may take a few business days to appear on your statement.</p>
      ${detailsTable([
        ['Order number', `#${escapeHtml(payment.orderNumber)}`],
        ['Amount refunded', formatMoney(payment.amount)],
      ])}`,
  });
}
