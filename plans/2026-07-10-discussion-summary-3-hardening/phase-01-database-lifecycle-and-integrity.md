# Phase 1: Database Lifecycle and Integrity

## Context

- `plans/discussion-summary-3.md`
- `packages/database/prisma/schema.prisma`
- `scripts/e2e-with-db.mjs`

## Changes

- Make `prisma migrate deploy` the fresh-setup and isolated-test baseline.
- Keep `db:push` only for disposable prototyping.
- Add a forward migration for the integration-organization foreign key.
- Transition expired invitations durably.
- Protect the Owner invariant with Serializable transactions and bounded retry.

## Validation

- Prisma generate and migration validation.
- Focused auth/database tests.
- PostgreSQL concurrency and integrity proof when equipped.

## Risks and Rollback

- Existing databases created only with `db:push` need explicit baseline
  reconciliation; do not silently mark migrations applied.
- The new foreign key fails fast when orphan integration rows exist rather than
  deleting configuration silently.

