# Phase 04: Database Integrity Hardening

## Status

Implemented as `US-035`.

## Goal

Tighten persisted invariants and query support where the boilerplate already
has generic platform models.

## Candidate Stories

- Add missing indexes and uniqueness constraints for accepted query patterns and
  invariants.
- Decide and enforce the correct `FeatureFlag` uniqueness model.
- Reconcile invitation role data with the accepted RBAC model.
- Reconcile seed data with the access-control catalog.

## Risk

High-risk. This phase touches schema, migrations, uniqueness, seed behavior,
and existing data semantics.

## Files To Inspect First

- `packages/database/prisma/schema.prisma`
- `packages/database/src/seed.ts`
- `packages/auth/src/**`
- `packages/access-control/src/**`
- Invitation and RBAC tests.

## Validation

- `pnpm --filter @repo/database db:generate`
- Prisma validate.
- Focused database/auth tests.
- Seed idempotency smoke when seed behavior changes.
- `pnpm test:e2e:db` if auth, organization, or invitation flows change.
- `pnpm release:check`

## Pause Points

- Confirm whether feature flags are global, organization-scoped, or both.
- Confirm whether invitation role should be stored as a relation, immutable
  role snapshot, or both.
- Confirm migration expectations before changing constraints that could affect
  existing local data.

## Outcome

- Global and organization feature flags use required `scopeId` uniqueness.
- Invitation roles have a nullable foreign-key relation with safe delete
  semantics.
- System-role seed runs reconcile permission rows with the policy catalog.
- Initial migration, query indexes, and provider idempotency constraints are
  checked in and validated against PostgreSQL.
