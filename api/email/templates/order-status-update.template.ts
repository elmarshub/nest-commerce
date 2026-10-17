import { escapeHtml } from '../../common/html-escape';
import { detailsTable, emailLayout } from './layout';

function prettyStatus(status: string): string {
  const text = status.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function orderStatusUpdateTemplate(order: {
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
}): string {
  const status = escapeHtml(prettyStatus(order.status));
  const rows: [string, string][] = [
    ['Order number', `#${escapeHtml(order.orderNumber)}`],
    ['Status', status],
  ];
  if (order.trackingNumber) {
    rows.push(['Tracking number', escapeHtml(order.trackingNumber)]);
  }

  return emailLayout({
    preheader: `Your order is now: ${prettyStatus(order.status)}.`,
    heading: 'Your order has been updated',
    body: `<p style="margin:0;">The status of your order has changed.</p>${detailsTable(rows)}`,
  });
}
