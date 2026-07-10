---
status: completed
---

# Phase 02: Organization and Data Integrity

## Completion

- [x] Reconcile all system roles for new and legacy organizations.
- [x] Add race-safe pending invitation uniqueness and retry.
- [x] Add global integration identity partial uniqueness.
- [x] Add canonical scoped job idempotency migration.
- [x] Validate schema and forward migration design.

## Requirements

- Reconcile Owner, Admin, Member, and Viewer system roles through one helper.
- Enforce one pending invitation per organization and normalized email.
- Preserve re-invitation semantics under concurrent requests.
- Enforce global integration identity uniqueness without duplicating tenant
  ownership into a second scope field.
- Scope job idempotency with a non-null canonical scope key.

## Files

- `packages/database/src/system-roles.ts`
- `packages/database/src/seed.ts`
- `packages/database/prisma/schema.prisma`
- New Prisma migration.
- `packages/auth/src/organizations.ts`
- `packages/auth/src/invitations.ts`
- Related tests.

## Validation

- Prisma generate/validate and clean migration apply.
- Auth/database tests plus PostgreSQL concurrency proof.

## Risks

- Existing duplicate pending invitations or global integration identities must
  fail migration visibly rather than be deleted silently.
