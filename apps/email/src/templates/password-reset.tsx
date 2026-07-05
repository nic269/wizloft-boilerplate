import { PasswordResetEmail } from "@repo/mail";

export default function Preview() {
	return <PasswordResetEmail appName="Wizloft" resetUrl="https://app.example.com/reset-password/token" />;
}
