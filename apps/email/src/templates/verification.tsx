import { VerificationEmail } from "@repo/mail/templates";

export { VerificationEmail } from "@repo/mail/templates";

export default function VerificationPreview() {
  return (
    <VerificationEmail
      appName="Wizloft"
      verifyUrl="https://app.example.com/verify-email/token"
    />
  );
}
