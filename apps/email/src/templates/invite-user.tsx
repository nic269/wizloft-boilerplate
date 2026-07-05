import { InviteUserEmail } from "@repo/mail/templates";

export default function Preview() {
	return (
		<InviteUserEmail inviterName="Anh Nguyen" organizationName="Acme" inviteUrl="https://example.com/invite/token" />
	);
}
