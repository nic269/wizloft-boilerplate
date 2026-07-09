# Overview

## Current Behavior

Organizations can be created, owners can invite members, invitations create active memberships, and audit records are
written for onboarding and invitation events. There is no user-facing way to inspect roles, assign a different role, or
review organization audit history.

## Target Behavior

Organization users with the right permissions can list roles, create organization-scoped roles from a known permission
catalog, list active members, update a member's role inside the same organization, and view recent audit events.

## Affected Users

- Organization owners and future administrators.
- Active organization members with delegated role or audit permissions.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`

## Non-Goals

- Deleting roles.
- Editing existing role permissions.
- Cross-organization or platform-wide audit search.
- Billing, Shopify, or Ops Hub domain permissions.

