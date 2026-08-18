export function orderConfirmationTemplate(order: {
  orderNumber: string;
  totalAmount: number;
}): string {
  return `
    <p>Thanks for your order!</p>
    <p>Order number: <strong>${order.orderNumber}</strong></p>
    <p>Total: <strong>$${order.totalAmount.toFixed(2)}</strong></p>
    <p>We'll let you know once your payment is confirmed.</p>
  `;
}
