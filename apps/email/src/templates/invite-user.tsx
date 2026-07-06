import { InviteUserEmail } from "../../../../packages/mail/src/templates";

export { InviteUserEmail } from "../../../../packages/mail/src/templates";

export default function InviteUserPreview() {
  return (
    <InviteUserEmail
      inviterName="Anh Nguyen"
      inviteUrl="https://app.example.com/invitations/accept/token"
      organizationName="Wizloft Workspace"
    />
  );
}
