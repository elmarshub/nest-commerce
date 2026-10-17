export function emailVerificationTemplate(verifyLink: string): string {
  return `
    <p>Thanks for signing up! Please verify your email address to activate your account.</p>
    <p><a href="${verifyLink}">Click here to verify your email</a></p>
    <p>This link expires in 24 hours. If you didn't create this account, you can safely ignore this email.</p>
  `;
}
