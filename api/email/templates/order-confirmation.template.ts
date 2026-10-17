import { escapeHtml } from '../../common/html-escape';
import {
  detailsTable,
  emailLayout,
  itemsTable,
  totalRow,
  type EmailItem,
} from './layout';

export function orderConfirmationTemplate(order: {
  orderNumber: string;
  totalAmount: number;
  items?: EmailItem[];
  shippingAddress?: string | null;
  orderUrl?: string;
  shopUrl?: string;
}): string {
  const rows: [string, string][] = [
    ['Order number', `#${escapeHtml(order.orderNumber)}`],
  ];
  if (order.shippingAddress) {
    rows.push(['Shipping to', escapeHtml(order.shippingAddress)]);
  }

  return emailLayout({
    preheader: `We've received your order #${order.orderNumber}.`,
    icon: '&#10003;',
    heading: 'Thanks for your order!',
    body: `<p style="margin:0;text-align:center;">We've received your order and will let you know as soon as your payment is confirmed.</p>
      ${detailsTable(rows)}
      ${itemsTable(order.items ?? [])}
      ${totalRow('Total', order.totalAmount)}`,
    cta: order.orderUrl
      ? { label: 'View your order', url: order.orderUrl }
      : undefined,
    shopUrl: order.shopUrl,
  });
}
