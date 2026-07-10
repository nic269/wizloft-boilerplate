# 0019 Migration-First Database Lifecycle

Date: 2026-07-10

## Status

Accepted

## Context

Raw SQL migrations contain partial and expression indexes plus data backfills
that Prisma schema push cannot reproduce. A `db:push` baseline allows local,
CI, and E2E databases to differ from production.

## Decision

Fresh setup, generated projects, CI, and isolated database tests use
`prisma migrate deploy`. Schema changes use `prisma migrate dev`. `db:push`
remains available only for rapid prototyping on disposable databases.

## Alternatives Considered

1. Continue using `db:push` and recreate raw constraints in tests. Rejected
   because it produces a second database contract.

## Consequences

Positive:

- Local, CI, E2E, and production databases execute the same migration history.
- Raw SQL constraints and backfills receive real validation.

Tradeoffs:

- Persistent databases created only with `db:push` require deliberate baseline
  reconciliation before adopting migration deploy.

## Follow-Up

- Document environment-specific baselining when a real legacy database needs
  migration.

