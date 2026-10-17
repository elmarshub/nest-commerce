import { escapeHtml } from '../../common/html-escape';
import { detailsTable, emailLayout, formatMoney, totalRow } from './layout';

export function refundConfirmationTemplate(payment: {
  orderNumber: string;
  amount: number;
  shopUrl?: string;
}): string {
  return emailLayout({
    preheader: `Your refund of ${formatMoney(payment.amount)} is on its way.`,
    icon: '&#8617;',
    heading: 'Your refund has been processed',
    body: `<p style="margin:0;text-align:center;">We've refunded your payment. It may take a few business days to appear on your statement.</p>
      ${detailsTable([['Order number', `#${escapeHtml(payment.orderNumber)}`]])}
      ${totalRow('Amount refunded', payment.amount)}`,
    shopUrl: payment.shopUrl,
  });
}
