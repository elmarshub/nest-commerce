import { escapeHtml } from '../../common/html-escape';
import { detailsTable, emailLayout, formatMoney } from './layout';

export function orderConfirmationTemplate(order: {
  orderNumber: string;
  totalAmount: number;
}): string {
  return emailLayout({
    preheader: `We've received your order #${order.orderNumber}.`,
    heading: 'Thanks for your order!',
    body: `<p style="margin:0;">We've received your order and will let you know as soon as your payment is confirmed.</p>
      ${detailsTable([
        ['Order number', `#${escapeHtml(order.orderNumber)}`],
        ['Order total', formatMoney(order.totalAmount)],
      ])}`,
  });
}
