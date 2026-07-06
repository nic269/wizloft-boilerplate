import { PasswordResetEmail } from "../../../../packages/mail/src/templates";

export { PasswordResetEmail } from "../../../../packages/mail/src/templates";

export default function PasswordResetPreview() {
  return <PasswordResetEmail appName="Wizloft" resetUrl="https://app.example.com/reset-password/token" />;
}
