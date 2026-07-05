# Validation

## Proof Strategy

Prove the authorization boundary and audit side effects with unit and API tests, then run repo-level checks and build.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Permission catalog validation, org-scoped role/member/audit queries, role creation audit, member role update audit. |
| Integration | Hono authorization gates and request/response behavior for role/member/audit routes. |
| E2E | Existing auth and invitation flows should remain green; role/audit UI is covered by build and API tests for this slice. |
| Platform | `pnpm check`, `pnpm check-types`, `pnpm boundaries`, `pnpm build`. |
| Performance | Audit query is capped to 50 rows. |
| Logs/Audit | `role.created` and `member.role_updated` records are asserted in unit tests. |

## Fixtures

- `owner-1` with role/member/audit permissions.
- `org-1` organization.
- `member-1` active membership.
- `role-1` and `role-2` organization roles.

## Commands

```text
pnpm --filter @repo/auth test -- access-control
pnpm --filter @repo/api-app test
pnpm check
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test -- access-control` passed 5 files, 16 tests.
- `pnpm --filter @repo/api test` passed 1 file, 12 tests.
- `pnpm check` passed 178 files with no remaining fixes.
- `pnpm check-types` passed 24/24 tasks.
- `pnpm test` passed 24/24 tasks.
- `pnpm boundaries` passed.
- `pnpm build` passed 8/8 tasks; Storybook emitted existing asset-size warnings only.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm test:e2e` passed
  4/4 after restarting stale dev servers that had occupied ports 3000/3002.
