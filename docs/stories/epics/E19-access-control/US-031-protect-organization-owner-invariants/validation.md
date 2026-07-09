# Validation

## Proof Strategy

Prove the invariant at the service boundary and the API boundary, then run the
standard release ladder because authorization behavior changed.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | `updateMemberRole` rejects demoting the only active Owner, allows demoting one Owner when another active Owner remains, and writes audit only after successful updates. |
| Integration | API maps last-owner invariant failure to 409 `CONFLICT` without changing the route contract. |
| E2E | Existing auth/invitation E2E remains sufficient unless UI behavior changes. |
| Platform | `pnpm release:check`. |
| Performance | Not applicable. |
| Logs/Audit | Rejected last-owner updates do not write `member.role_updated`; successful updates still do. |

## Fixtures

- `org-1` organization.
- `member-1` active membership currently linked to role `Owner`.
- `role-2` non-owner target role.
- Optional second active Owner membership for allowed transfer coverage.

## Commands

```text
pnpm --filter @repo/auth test
pnpm --filter @repo/api test
pnpm check:ci
pnpm check-types
pnpm boundaries
pnpm release:check
scripts/bin/harness-cli story verify US-031
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test` passed: 5 files, 18 tests.
- `pnpm --filter @repo/api test` passed: 3 files, 25 tests.
- `pnpm --filter @repo/auth check-types` passed.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm check:ci` passed: Ultracite checked 300 files.
- `pnpm check-types` passed: 25 workspace tasks.
- `pnpm boundaries` passed.
- `pnpm release:check` passed: template validation, lint, typecheck, tests,
  boundaries, and 9 builds.
- `scripts/bin/harness-cli story verify US-031` passed.
