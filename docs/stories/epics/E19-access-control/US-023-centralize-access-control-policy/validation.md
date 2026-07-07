# Validation

## Proof Strategy

Unit tests prove catalog-derived presets and normalization. Existing auth and
API suites prove authorization behavior. Full workspace validation proves the
new browser-safe dependency and generated-project build topology.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Catalog keys, unknown rejection, deduplication, presets, UI defaults |
| Integration | Owner/Member provisioning, role normalization, API permission gates |
| E2E | Existing authorization flows; no new user behavior |
| Platform | Package boundaries, all workspace types, Next/API builds |
| Performance | Not required for static arrays and pure guards |
| Logs/Audit | Existing role/member audit behavior unchanged |

## Fixtures

Existing mocked auth/database transactions plus pure policy fixtures.

## Commands

```text
pnpm --filter @repo/access-control test
pnpm --filter @repo/auth test
pnpm --filter @repo/api test
pnpm boundaries
pnpm release:check
```

## Acceptance Evidence

- Access-control policy tests passed 3/3, auth tests 16/16, and API tests
  22/22.
- All 25 workspace typecheck and test tasks passed with the new package graph.
- Ultracite checked 295 files and boundary enforcement passed.
- `pnpm release:check` passed all nine build tasks, including the app consuming
  the browser-safe package and Prisma generation consuming role presets.
- Existing Storybook size and source-only Turbo output warnings remain unchanged.
