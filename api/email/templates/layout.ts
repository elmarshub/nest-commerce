import { escapeHtml } from '../../common/html-escape';

const BRAND = 'Havens';
const FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export interface EmailItem {
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
}

interface EmailLayoutOptions {
  /** Short text shown next to the subject in the inbox list. */
  preheader: string;
  heading: string;
  /** Round badge above the heading, e.g. a check mark. */
  icon?: string;
  /** Trusted HTML for the message body (escape user data before passing it in). */
  body: string;
  cta?: { label: string; url: string };
  /** Small grey text under the button/body. */
  footnote?: string;
  /** Link shown in the footer, normally the storefront. */
  shopUrl?: string;
}

/** Shared, inbox-safe shell (tables + inline styles) used by every email. */
export function emailLayout({
  preheader,
  heading,
  icon,
  body,
  cta,
  footnote,
  shopUrl,
}: EmailLayoutOptions): string {
  const badge = icon
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 20px;">
        <tr><td align="center" width="56" height="56" style="width:56px;height:56px;border-radius:28px;background:#111111;color:#ffffff;font-size:26px;line-height:56px;font-family:${FONT};">${icon}</td></tr>
      </table>`
    : '';

  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:30px auto 8px;">
        <tr><td align="center" style="background:#111111;border-radius:999px;">
          <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:15px 34px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;font-family:${FONT};">${escapeHtml(cta.label)}</a>
        </td></tr>
      </table>
      <p style="margin:18px 0 0;text-align:center;font-size:12px;line-height:18px;color:#9ca3af;">Button not working? Copy this link into your browser:<br><a href="${escapeHtml(cta.url)}" style="color:#6b7280;word-break:break-all;">${escapeHtml(cta.url)}</a></p>`
    : '';

  const note = footnote
    ? `<p style="margin:26px 0 0;padding-top:20px;border-top:1px solid #eeeeee;font-size:13px;line-height:20px;color:#6b7280;">${footnote}</p>`
    : '';

  const shopLink = shopUrl
    ? `<a href="${escapeHtml(shopUrl)}" style="color:#6b7280;text-decoration:underline;">Visit the store</a><br>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f3f2ef;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2ef;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td align="center" style="background:#111111;border-radius:16px 16px 0 0;padding:30px 20px;font-family:Georgia,'Times New Roman',serif;font-size:30px;letter-spacing:6px;text-transform:uppercase;color:#ffffff;">${BRAND}</td></tr>
        <tr><td style="background:#ffffff;border-radius:0 0 16px 16px;padding:40px 36px 36px;font-family:${FONT};color:#111111;">
          ${badge}
          <h1 style="margin:0 0 14px;text-align:center;font-size:24px;line-height:32px;font-weight:700;color:#111111;">${escapeHtml(heading)}</h1>
          <div style="font-size:15px;line-height:25px;color:#4b5563;">${body}</div>
          ${button}
          ${note}
        </td></tr>
        <tr><td align="center" style="padding:22px 10px 0;font-family:${FONT};font-size:12px;line-height:19px;color:#9ca3af;">
          ${shopLink}You're receiving this email because of activity on your ${BRAND} account.<br>&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Key/value rows for order details (values must already be escaped). */
export function detailsTable(rows: [label: string, value: string][]): string {
  const cells = rows
    .map(
      ([label, value]) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;color:#6b7280;">${label}</td>
        <td align="right" style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:600;color:#111111;">${value}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;">${cells}</table>`;
}

/** Product rows with thumbnail, quantity and line price. */
export function itemsTable(items: EmailItem[]): string {
  if (!items.length) return '';

  const rows = items
    .map((item) => {
      const image = item.imageUrl
        ? `<img src="${escapeHtml(item.imageUrl)}" width="64" height="64" alt="" style="display:block;width:64px;height:64px;object-fit:cover;border-radius:8px;background:#f3f2ef;">`
        : '';
      return `<tr>
        <td width="76" style="padding:14px 0;border-bottom:1px solid #eeeeee;vertical-align:middle;">${image}</td>
        <td style="padding:14px 8px;border-bottom:1px solid #eeeeee;vertical-align:middle;font-size:14px;line-height:20px;color:#111111;"><strong>${escapeHtml(item.productName)}</strong><br><span style="color:#6b7280;">Qty ${item.quantity}</span></td>
        <td align="right" style="padding:14px 0;border-bottom:1px solid #eeeeee;vertical-align:middle;font-size:14px;font-weight:600;color:#111111;white-space:nowrap;">${formatMoney(item.price * item.quantity)}</td>
      </tr>`;
    })
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 4px;">${rows}</table>`;
}

/** Bold total line shown under the items. */
export function totalRow(label: string, amount: number): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 0;">
    <tr>
      <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:#111111;">${escapeHtml(label)}</td>
      <td align="right" style="padding:14px 0 0;font-size:18px;font-weight:700;color:#111111;">${formatMoney(amount)}</td>
    </tr>
  </table>`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
