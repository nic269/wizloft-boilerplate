# US-005: Invitation Lifecycle

## Current Behavior

Organizations have Owner memberships and RBAC permissions, but users cannot invite or onboard collaborators.

## Target Behavior

- Authorized members can list, create, and revoke invitations for their organization.
- Invitation tokens are returned once for delivery and stored only as SHA-256 hashes.
- The optional mail provider delivers an acceptance URL and falls back to the console provider when unconfigured.
- A signed-in user whose normalized email matches the invitation can accept a pending, unexpired invitation.
- Acceptance atomically activates membership, marks the invitation accepted, and writes audit evidence.

## Affected Users

- Organization owners and administrators with `members:invite` permission.
- Invited users.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`

## Non-Goals

- Custom role selection or role editor UI.
- Removing or disabling existing members.
- Mandatory email verification before acceptance.

