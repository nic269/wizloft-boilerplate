# US-004 Validation

## Proof Strategy

Prove authorization and response contracts at the Hono route, transactional behavior at the organization service,
and the dashboard workflow through build/type validation.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Slug normalization and default Owner permission provisioning |
| Integration | Authenticated create/list scope; anonymous rejection; duplicate slug response |
| E2E | Deferred until invitation/member flow extends the browser journey |
| Platform | Production build and API development smoke |
| Performance | Not required for bounded onboarding writes |
| Logs/Audit | Transaction test proves `organization.created` write |

## Fixtures

- Authenticated user `user-1`.
- Organization `Acme Studio` / `acme-studio`.

## Commands

```text
pnpm --filter @repo/auth test
pnpm --filter @repo/api test
pnpm check
pnpm check-types
pnpm boundaries
pnpm build
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test`: 3 files, 7 tests passed.
- `pnpm --filter @repo/api test`: 1 file, 4 tests passed.
- PostgreSQL smoke: organization created, Owner role assigned, membership-scoped list returned it, and
  `organization.created` audit record existed; temporary records were removed.
- `pnpm check`: 167 files passed after formatting.
- `pnpm check-types`: 24 tasks passed.
- `pnpm test`: 24 tasks passed.
- `pnpm boundaries`: passed.
- `pnpm build`: 8 tasks passed.
