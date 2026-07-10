# Validation

## Proof Strategy

Prove each changed contract narrowly, then run database, browser, container,
generated-project, and full release checks.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Auth config/session, outbox, role sync, provider policy, jobs, cursors, manifest validation |
| Integration | Concurrent invitations, database indexes, API contracts and OpenAPI |
| E2E | Signup verification and invitation callbacks through isolated outbox |
| Platform | Production provider startup/readiness and crawler assets |
| Logs/Audit | Outbox logs metadata only; readiness explains provider failures |

## Fixtures

- Unique per-test users and organizations.
- Temporary mail outbox directory.
- Clean PostgreSQL database with migrations applied.

## Commands

```text
pnpm check:ci
pnpm check-types
pnpm test
pnpm boundaries
pnpm test:e2e:db
pnpm docker:validate
pnpm release:check
```

## Acceptance Evidence

- Source `pnpm release:check`: passed after final fixes.
- Generated project at `/private/tmp/wizloft-us037-generated-20260710`:
  install and `pnpm release:check` passed.
- Independent tester: affected packages 20 files/90 tests passed before final
  security regressions; final auth suite passed 10 files/46 tests.
- Prisma schema validation and clean forward migration proof passed during the
  database implementation slice; final SQL backfill and indexes were reviewed.
- Mandatory code review: PASS after legacy-organization, provider-policy,
  callback-sanitization, and Docker-outbox blockers were fixed.
- Harness browser, Docker, and PostgreSQL capabilities were absent, so direct
  browser/runtime re-runs were clean skips. E2E flows were updated to consume
  recipient-specific verification messages from the private outbox.
