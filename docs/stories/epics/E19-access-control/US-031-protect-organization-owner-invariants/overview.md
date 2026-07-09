# Overview

## Current Behavior

Organization creation provisions an active creator membership with an
organization-scoped `Owner` role. Role management can later update any active
membership to any role in the same organization, including demoting the only
active Owner.

## Target Behavior

Role assignment must not leave an organization without at least one active
Owner membership. If an update would remove the final active Owner, the command
is rejected with a conflict response and no audit record is written.

## Affected Users

- Organization owners and administrators managing member roles.
- Future product teams starting from the boilerplate RBAC defaults.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/decisions/0009-organization-ownership-boundary.md`
- `docs/release-readiness.md`

## Non-Goals

- Role deletion.
- Role permission editing.
- Database schema migration for system-role flags.
- Suspended-user enforcement.
- Better Auth email verification or password reset hardening.
