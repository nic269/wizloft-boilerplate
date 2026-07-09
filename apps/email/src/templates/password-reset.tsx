import { PasswordResetEmail } from "@repo/mail/templates";

export { PasswordResetEmail } from "@repo/mail/templates";

export default function PasswordResetPreview() {
  return (
    <PasswordResetEmail
      appName="Wizloft"
      resetUrl="https://app.example.com/reset-password/token"
    />
  );
}
