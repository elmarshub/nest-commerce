import { escapeHtml } from '../../common/html-escape';

export function orderStatusUpdateTemplate(order: {
  orderNumber: string;
  status: string;
  trackingNumber?: string | null;
}): string {
  const trackingLine = order.trackingNumber
    ? `<p>Tracking number: <strong>${escapeHtml(order.trackingNumber)}</strong></p>`
    : '';

  return `
    <p>Your order status has changed to <strong>${escapeHtml(order.status)}</strong>.</p>
    ${trackingLine}
  `;
}
