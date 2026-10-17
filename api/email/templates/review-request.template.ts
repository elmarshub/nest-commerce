import { escapeHtml } from '../../common/html-escape';

export function reviewRequestTemplate(order: {
  orderNumber: string;
  items: { productName: string }[];
  accountUrl: string;
}): string {
  const itemsList = order.items
    .map((item) => `<li>${escapeHtml(item.productName)}</li>`)
    .join('');

  return `
    <p>Your order <strong>#${escapeHtml(order.orderNumber)}</strong> has been delivered.</p>
    <p>We'd love to hear what you think — leave a review for:</p>
    <ul>${itemsList}</ul>
    <p><a href="${order.accountUrl}">Leave a review</a></p>
  `;
}
