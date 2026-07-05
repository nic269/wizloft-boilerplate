# US-004: Organization Onboarding

## Current Behavior

Authenticated users can reach the dashboard, but the organization API exposes every organization and there is no
usable onboarding flow.

## Target Behavior

- An authenticated user can create an organization from the dashboard.
- Creation atomically provisions an Owner role, baseline permissions, an active membership, and an audit record.
- Organization listing returns only organizations where the current user has an active membership.
- Anonymous requests receive a stable unauthorized API error.

## Affected Users

- Authenticated product users.
- API consumers using a Better Auth session.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`

## Non-Goals

- Invitation creation and acceptance.
- Custom role management UI.
- Organization switching persisted in the session.

