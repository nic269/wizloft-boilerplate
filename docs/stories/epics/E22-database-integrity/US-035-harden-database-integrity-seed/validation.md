# Validation

## Proof Strategy

Prisma validates/generates the client, unit tests prove catalog replacement,
and clean PostgreSQL proves migration plus idempotent seed behavior.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Seed replaces system-role permission rows from the catalog. |
| Integration | Initial migration applies; two seed runs retain 4 roles/23 permissions. |
| E2E | Existing auth, organization, and invitation journeys pass. |
| Platform | `migrate deploy` works against clean PostgreSQL. |
| Performance | Query indexes match expiry/status lookup patterns. |
| Logs/Audit | Seed exits nonzero on transaction failure. |

## Commands

```text
pnpm --filter @repo/database generate
pnpm --filter @repo/database test
pnpm test:e2e:db
pnpm release:check
```

## Acceptance Evidence

Initial migration applied to PostgreSQL 17. Seed ran twice and retained 4
system roles with 23 permissions. Six browser journeys passed.
