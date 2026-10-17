import { emailLayout } from './layout';

export function passwordResetTemplate(resetLink: string): string {
  return emailLayout({
    preheader: 'Use this link to choose a new password.',
    icon: '&#128274;',
    heading: 'Reset your password',
    body: '<p style="margin:0;text-align:center;">We received a request to reset the password on your account. Click the button below to choose a new one.</p>',
    cta: { label: 'Reset password', url: resetLink },
    footnote:
      "This link expires in 1 hour. If you didn't request this, you can safely ignore this email.",
  });
}
