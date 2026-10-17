import { escapeHtml } from '../../common/html-escape';

const BRAND = 'Havens';

interface EmailLayoutOptions {
  /** Short text shown next to the subject in the inbox list. */
  preheader: string;
  heading: string;
  /** Trusted HTML for the message body (escape user data before passing it in). */
  body: string;
  cta?: { label: string; url: string };
  /** Small grey text under the button/body. */
  footnote?: string;
}

/** Shared, inbox-safe shell (tables + inline styles) used by every email. */
export function emailLayout({
  preheader,
  heading,
  body,
  cta,
  footnote,
}: EmailLayoutOptions): string {
  const button = cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px;">
        <tr><td style="background:#111111;border-radius:8px;">
          <a href="${escapeHtml(cta.url)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${escapeHtml(cta.label)}</a>
        </td></tr>
      </table>
      <p style="margin:16px 0 0;font-size:12px;line-height:18px;color:#6b7280;">Button not working? Copy this link into your browser:<br><a href="${escapeHtml(cta.url)}" style="color:#6b7280;word-break:break-all;">${escapeHtml(cta.url)}</a></p>`
    : '';

  const note = footnote
    ? `<p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;">${footnote}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(heading)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
        <tr><td style="padding:0 0 20px;text-align:center;font-family:Georgia,'Times New Roman',serif;font-size:26px;letter-spacing:2px;color:#111111;">${BRAND}</td></tr>
        <tr><td style="background:#ffffff;border-radius:12px;padding:36px 32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#111111;">
          <h1 style="margin:0 0 16px;font-size:22px;line-height:30px;font-weight:700;color:#111111;">${escapeHtml(heading)}</h1>
          <div style="font-size:15px;line-height:24px;color:#374151;">${body}</div>
          ${button}
          ${note}
        </td></tr>
        <tr><td style="padding:20px 8px 0;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;line-height:18px;color:#9ca3af;">
          You're receiving this email because of activity on your ${BRAND} account.<br>&copy; ${new Date().getFullYear()} ${BRAND}. All rights reserved.
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
        <td style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;color:#6b7280;">${label}</td>
        <td align="right" style="padding:10px 0;border-bottom:1px solid #e5e7eb;font-size:14px;font-weight:600;color:#111111;">${value}</td>
      </tr>`,
    )
    .join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px;">${cells}</table>`;
}

export function formatMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
