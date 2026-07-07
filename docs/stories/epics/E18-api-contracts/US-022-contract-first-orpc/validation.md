# Validation

## Proof Strategy

Prove contract/runtime/client alignment with focused tests, then run package
boundaries and the full release ladder because the API package is shared by the
Hono and Next applications.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Generated paths and client success/error decoding |
| Integration | Auth, permissions, organizations, invitations, providers, status, and validation compatibility |
| E2E | Existing auth/invitation suite; no new product behavior |
| Platform | API/app typecheck, boundaries, and production builds |
| Performance | No benchmark required; handler initialized once per process |
| Logs/Audit | Hono request logging and domain audit behavior unchanged |

## Fixtures

Existing mocked sessions, organizations, invitations, roles, members, audit
logs, mail delivery, storage, and jobs provider statuses.

## Commands

```text
pnpm --filter @repo/api test
pnpm --filter @repo/api check-types
pnpm --filter @repo/app check-types
pnpm boundaries
pnpm release:check
```

## Acceptance Evidence

- API contract, handler, OpenAPI, compatibility, and client suites passed 22/22.
- All 24 workspace typecheck tasks passed.
- Ultracite checked 287 files without changes and boundary enforcement passed.
- `pnpm release:check` passed template validation, lint, types, tests,
  boundaries, and all eight production build tasks.
- Storybook emitted only the previously accepted bundle-size warnings.
