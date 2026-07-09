# Validation

## Proof Strategy

Prove that the shared session helper rejects non-active users and that direct
permission checks also reject suspended users, then run the release ladder.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `getCurrentSession` returns a session only for `ACTIVE` users and returns `null` for `SUSPENDED`, `INVITED`, missing users, or no Better Auth session. |
| Integration | `hasPermission` denies suspended super-admin and membership paths; API routes continue returning `401` when the shared session helper returns null. |
| E2E | Existing auth E2E remains enough unless UI status management is added. |
| Platform | `pnpm release:check`. |
| Performance | One user status lookup per shared session resolution. |
| Logs/Audit | No audit on denied access; future admin suspension mutation should own audit evidence. |

## Fixtures

- Active user session.
- Suspended user session.
- Invited user session.
- Missing user session.
- Suspended super-admin row.

## Commands

```text
pnpm --filter @repo/auth test
pnpm --filter @repo/api test
pnpm --filter @repo/auth check-types
pnpm --filter @repo/api check-types
pnpm check:ci
pnpm check-types
pnpm boundaries
pnpm release:check
scripts/bin/harness-cli story verify US-032
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test` passed: 7 files, 29 tests.
- `pnpm --filter @repo/api test` passed: 3 files, 26 tests.
- `pnpm --filter @repo/auth check-types` passed.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm check:ci` passed: Ultracite checked 302 files.
- `pnpm check-types` passed: 25 workspace tasks.
- `pnpm boundaries` passed.
- `pnpm release:check` passed: template validation, lint, typecheck, tests,
  boundaries, and 9 builds.
- `scripts/bin/harness-cli story verify US-032` passed.
