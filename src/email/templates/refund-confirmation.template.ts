export function refundConfirmationTemplate(payment: {
  orderNumber: string;
  amount: number;
}): string {
  return `
    <p>Your refund has been processed.</p>
    <p>Order number: <strong>${payment.orderNumber}</strong></p>
    <p>Amount refunded: <strong>$${payment.amount.toFixed(2)}</strong></p>
    <p>It may take a few business days to appear on your statement.</p>
  `;
}
