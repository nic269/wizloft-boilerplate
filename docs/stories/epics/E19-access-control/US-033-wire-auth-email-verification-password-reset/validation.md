# Validation

## Proof Strategy

Prove that Better Auth config exposes reset and verification callbacks, that
both callbacks send through `@repo/mail` with the shared email templates, and
that the app browser screens typecheck against the installed Better Auth client
API. Then run package typechecks, boundary checks, and release checks to ensure
the workspace dependency remains valid.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Auth option callbacks call `sendMail` for password reset and email verification. |
| Integration | API/auth runtime and app recovery pages typecheck through Better Auth config/client. |
| E2E | Existing browser-auth suite remains the smoke layer; focused typecheck covers the new forms. |
| Platform | `pnpm release:check` proves package graph and builds. |
| Performance | Not applicable. |
| Logs/Audit | Existing console mail provider logs are reused. |

## Fixtures

- Deterministic user object with `user@example.com`.
- Local reset URL and verification URL.
- Mocked `sendMail`.

## Commands

```text
pnpm --filter @repo/auth test
pnpm --filter @repo/auth check-types
pnpm --filter @repo/app check-types
pnpm check:ci
pnpm check-types
pnpm boundaries
pnpm release:check
scripts/bin/harness-cli story verify US-033
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test`: passed, 8 files / 32 tests.
- `pnpm --filter @repo/auth check-types`: passed.
- `pnpm --filter @repo/app check-types`: passed after adding recovery and
  verification screens.
- `pnpm check:ci`: passed, 304 files checked.
- `pnpm check-types`: passed, 25 package typecheck tasks.
- `pnpm boundaries`: passed.
- `pnpm release:check`: passed, including template validation, lint,
  typecheck, tests, boundaries, and 9 build tasks.
