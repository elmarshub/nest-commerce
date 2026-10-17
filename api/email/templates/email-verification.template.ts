import { emailLayout } from './layout';

export function emailVerificationTemplate(verifyLink: string): string {
  return emailLayout({
    preheader: 'Confirm your email to activate your account.',
    icon: '&#9993;',
    heading: 'Verify your email address',
    body: '<p style="margin:0;text-align:center;">Thanks for signing up! Please confirm your email address to activate your account.</p>',
    cta: { label: 'Verify email', url: verifyLink },
    footnote:
      "This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.",
  });
}
