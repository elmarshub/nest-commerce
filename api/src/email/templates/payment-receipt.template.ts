import { escapeHtml } from '../../common/html-escape';

export function paymentReceiptTemplate(payment: {
  orderNumber: string;
  amount: number;
}): string {
  return `
    <p>We've received your payment.</p>
    <p>Order number: <strong>${escapeHtml(payment.orderNumber)}</strong></p>
    <p>Amount charged: <strong>$${payment.amount.toFixed(2)}</strong></p>
    <p>Your order is now being processed.</p>
  `;
}
