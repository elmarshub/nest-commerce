import { escapeHtml } from '../../common/html-escape';
import { emailLayout } from './layout';

export function reviewRequestTemplate(order: {
  orderNumber: string;
  items: { productName: string }[];
  accountUrl: string;
}): string {
  const itemsList = order.items
    .map(
      (item) =>
        `<li style="margin:0 0 6px;">${escapeHtml(item.productName)}</li>`,
    )
    .join('');

  return emailLayout({
    preheader: 'Tell us what you think of your order.',
    heading: 'How was your order?',
    body: `<p style="margin:0 0 12px;">Your order <strong>#${escapeHtml(order.orderNumber)}</strong> has been delivered. We'd love to hear what you think of:</p>
      <ul style="margin:0;padding-left:20px;">${itemsList}</ul>`,
    cta: { label: 'Leave a review', url: order.accountUrl },
  });
}
