import { VerificationEmail } from "../../../../packages/mail/src/templates";

export { VerificationEmail } from "../../../../packages/mail/src/templates";

export default function VerificationPreview() {
  return <VerificationEmail appName="Wizloft" verifyUrl="https://app.example.com/verify-email/token" />;
}
