# Serializable conflict classification

Date: 2026-09-05
Phase: 01 / BP-01

Status: **DESIGNED / NOT IMPLEMENTED**

Authorization: documentation planning only; implementation requires a new-session request.
Reference baseline: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
Parent: [initiative plan](plan.md). This document records intended behavior, not proof.

## Outcome and non-goals

Recognize actual Prisma/PostgreSQL serialization and deadlock errors so the existing
Owner-role transaction retries instead of leaking a wrapped infrastructure failure.
Keep the classifier reusable through `@repo/database`; keep Owner policy in auth.

Do not introduce a transaction runner, observer registry, subscriptions, diagnostics
event bus, retry configuration framework, queue, schema change, or tool dependency.
Do not change retry timing, add retries to other operations, or move authorization
and audit writes outside their transaction.

## Source context

- [Auth conflict check](../../packages/auth/src/access-control.ts) recognizes only
  top-level `code === "P2034"` at lines 30–34.
- The same file, lines 272–287, already owns three Serializable attempts and
  `OWNER_UPDATE_CONFLICT` after the final recognized conflict.
- [Database client](../../packages/database/src/client.ts) constructs Prisma with
  `PrismaPg`; [database manifest](../../packages/database/package.json) selects 7.8.
- [Unit coverage](../../packages/auth/src/access-control.test.ts) currently mocks
  top-level P2034. [Postgres coverage](../../packages/auth/integration/postgres.integration.test.ts)
  already exercises concurrent demotions and the retained Owner invariant.
- Auth's default `test` excludes integration tests. `release:check` alone does not
  establish PostgreSQL conflict behavior.

Read [architecture](../../docs/ARCHITECTURE.md) and the current auth implementation
again at implementation kickoff; the baseline may have advanced.

## Design contracts

1. Add a pure `isRetryableTransactionConflict(error: unknown): boolean` classifier.
   Give it a dedicated database export subpath so testing/importing it does not
   initialize Prisma or require `DATABASE_URL`.
2. Recognize exact structured values `P2034`, `40001`, `40P01`, and
   `TransactionWriteConflict`. No message substring matching or arbitrary string scan.
3. Traverse only documented, observed wrapper edges. Inspect the installed adapter
   and captured real error first; expected candidates include `cause`, `meta`, and
   `driverAdapterError`. Match `code`, `originalCode`, or `kind` only where that
   wrapper's observed structure assigns error meaning to them.
4. Use at most eight wrapper edges of depth and 32 visited objects;
   track object identity for cycles. Do not recursively visit every object property,
   stringify errors, or classify a business payload because it contains an error code.
5. Null, primitive, unknown, cyclic, excessive-depth, and inaccessible-property
   inputs must not introduce a new thrown error. Unsupported shapes return false.
6. Replace only the auth predicate. Preserve three total transaction attempts,
   Serializable isolation, successful return value, original unknown-error identity,
   last-Owner rules, actor checks, audit atomicity, and final public conflict code.
7. No public observer API is part of this correction. Existing logging stays intact.

The exact supported wrapper paths are an evidence task, not permission to copy a
product helper wholesale. Add only paths established by this repo's installed runtime.

## Affected files

Existing files to edit after authorization:

- `packages/auth/src/access-control.ts`: replace private classifier import/use.
- `packages/auth/src/access-control.test.ts`: retry success/exhaustion/unknown cases.
- `packages/auth/integration/postgres.integration.test.ts`: real contention evidence
  and unchanged authorization/audit integrity assertions.
- `packages/database/package.json`: explicit pure-helper export.
- `docs/ARCHITECTURE.md`, `docs/product/boilerplate-platform.md`: bounded ownership
  and behavior documentation after reading their current content.

Proposed new files:

- `packages/database/src/transaction-conflicts.ts`: pure classifier.
- `packages/database/src/transaction-conflicts.test.ts`: structured input coverage.

Generated projects inherit database/auth source and export maps. No generator
option, profile, branding rewrite, migration, template visual, or governance file
is introduced. Generate a fresh target to verify the new export resolves there.

## Implementation sequence

1. Confirm authorization and baseline; preserve unrelated changes. Follow the
   source repo's currently applicable workflow, recording unavailable tooling honestly.
   Complete the separate source-tooling precondition in the handoff before this
   phase; restoration is not part of the application correctness patch.
2. Inspect installed Prisma/adapter source. Build a controlled contention test with
   independent transactions and synchronization so an actual conflict is observed.
3. Record a sanitized structural error specimen, adapter version, and command;
   retain no connection strings, user data, or raw query parameters in fixtures.
4. Implement bounded classification with exact-path fixtures grounded in that evidence.
5. Integrate the classifier into the existing auth loop; expand focused tests.
6. Prove the real conflict is classified, retried, and preserves Owner/audit state.
7. Generate a temporary default project, validate it independently, review changes,
   and update documentation to describe only verified behavior.

## Verification to execute later

Focused commands from the repo root:

```bash
pnpm --filter @repo/database exec vitest run src/transaction-conflicts.test.ts
pnpm --filter @repo/auth exec vitest run src/access-control.test.ts
pnpm --filter @repo/database check-types
pnpm --filter @repo/auth check-types
```

For real PostgreSQL proof, use a task-owned isolated database, deploy checked-in
migrations, and run `pnpm --filter @repo/auth test:integration` with its explicit
`DATABASE_URL`. `pnpm test:e2e:db` already bootstraps a database and runs this test;
before the later hygiene fix, clear inherited service URL/reuse overrides and
ensure its fixed app/API ports are free. Never reuse unrelated running servers.

Require the controlled adapter test to prove it actually induced a conflict;
concurrent requests with no recorded conflict are insufficient adapter-shape proof.

Generate a unique temporary target using `pnpm boilerplate:init <target> --validate`;
run its own release command and confirm the pure classifier export resolves without
the source checkout. Finish source verification with `pnpm release:check`.
Record commands/results against the final revision; clean only task-owned resources.

## Acceptance

- Exact direct and supported wrapped conflict forms retry; deadlock is covered.
- Unknown/business errors do not retry; classifier traversal is bounded and safe.
- Retry success returns the committed result; exhaustion is exactly three attempts
  with the existing `OWNER_UPDATE_CONFLICT`; unknown failures preserve identity.
- Real installed-adapter conflict proof and concurrent Owner integrity pass.
- Generated output, public package export, focused tests, types, and release pass.
- No schema, provider, product-policy, or observer-framework expansion.

## Risks and rollback

Overbroad traversal could retry unrelated failures; use exact structured evidence.
A retryable transaction must keep external side effects out of its callback;
review the existing callback and retain transactional audit writes.
Contention tests can pass without a conflict unless synchronized and asserted.

Rollback is a focused revert of the helper/import/export/tests/docs; no database
migration or data rollback is required. Do not roll back unrelated work.

## Unresolved evidence

The real adapter wrapper specimen and deterministic conflict proof are not yet
captured. This plan does not claim tests, database, generation, or release passed.
