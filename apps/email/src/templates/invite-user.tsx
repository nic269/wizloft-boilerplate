import { InviteUserEmail } from "../../../../packages/mail/src/templates";

export { InviteUserEmail };

export default function InviteUserPreview() {
	return (
		<InviteUserEmail
			inviterName="Anh Nguyen"
			organizationName="Wizloft Workspace"
			inviteUrl="https://app.example.com/invitations/accept/token"
		/>
	);
}
