import { InviteUserEmail } from "@repo/mail";

export default function Preview() {
	return (
		<InviteUserEmail
			inviterName="Anh Nguyen"
			organizationName="Wizloft Workspace"
			inviteUrl="https://app.example.com/invitations/accept/token"
		/>
	);
}
