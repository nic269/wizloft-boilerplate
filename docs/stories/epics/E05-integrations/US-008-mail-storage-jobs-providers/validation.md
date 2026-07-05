# Validation

## Proof Strategy

Use unit tests for package contracts and API tests for provider status routes. Do not hit live external providers.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Mail fallback/status, storage key sanitizer/local/S3 status, local job completion/idempotency/retry failure. |
| Integration | Hono `/api/files` and `/api/jobs` status routes. |
| E2E | Existing auth/invitation E2E remains sufficient because no browser behavior changes. |
| Platform | `pnpm check`, `pnpm check-types`, `pnpm test`, `pnpm boundaries`, `pnpm build`. |
| Performance | Local job runner keeps in-memory run records only; no long-running loop. |
| Logs/Audit | Mail console delivery uses shared logger; no product audit records added. |

## Fixtures

- Missing Resend env.
- Incomplete S3 env.
- Local temp storage directory.
- Failing job handler with two retry attempts.

## Commands

```text
pnpm --filter @repo/mail --filter @repo/storage --filter @repo/jobs test
pnpm --filter @repo/mail --filter @repo/storage --filter @repo/jobs check-types
pnpm --filter @repo/api test
pnpm check
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

## Acceptance Evidence

- `pnpm install` passed without downloads.
- `pnpm --filter @repo/mail --filter @repo/storage --filter @repo/jobs test` passed 3 files, 9 tests.
- `pnpm --filter @repo/mail --filter @repo/storage --filter @repo/jobs check-types` passed.
- `pnpm --filter @repo/api test` passed 2 files, 18 tests.
- `pnpm check` passed 187 files after formatting.
- `pnpm check-types` passed 24/24 tasks.
- `pnpm test` passed 24/24 tasks.
- `pnpm boundaries` passed.
- `pnpm build` passed 8/8 tasks; Storybook emitted existing asset-size warnings only.
