import { escapeHtml } from '../../common/html-escape';
import {
  detailsTable,
  emailLayout,
  formatMoney,
  itemsTable,
  totalRow,
  type EmailItem,
} from './layout';

export function paymentReceiptTemplate(payment: {
  orderNumber: string;
  amount: number;
  items?: EmailItem[];
  orderUrl?: string;
  shopUrl?: string;
}): string {
  return emailLayout({
    preheader: `Payment of ${formatMoney(payment.amount)} received.`,
    icon: '$',
    heading: 'Payment received',
    body: `<p style="margin:0;text-align:center;">Thank you! We've received your payment and your order is now being processed.</p>
      ${detailsTable([['Order number', `#${escapeHtml(payment.orderNumber)}`]])}
      ${itemsTable(payment.items ?? [])}
      ${totalRow('Amount paid', payment.amount)}`,
    cta: payment.orderUrl
      ? { label: 'View your order', url: payment.orderUrl }
      : undefined,
    shopUrl: payment.shopUrl,
  });
}
