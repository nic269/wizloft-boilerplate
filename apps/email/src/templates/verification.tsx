import { VerificationEmail } from "@repo/mail";

export default function Preview() {
	return <VerificationEmail appName="Wizloft" verifyUrl="https://app.example.com/verify-email/token" />;
}
