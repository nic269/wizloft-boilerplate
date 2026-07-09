import { InviteUserEmail } from "@repo/mail/templates";

export { InviteUserEmail } from "@repo/mail/templates";

export default function InviteUserPreview() {
  return (
    <InviteUserEmail
      inviterName="Anh Nguyen"
      inviteUrl="https://app.example.com/invitations/accept/token"
      organizationName="Wizloft Workspace"
    />
  );
}
