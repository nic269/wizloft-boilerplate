# Validation

## Proof Strategy

Fast checks prove type safety, formatting, and guard behavior. Browser smoke proves the public auth workflow with the API
and app surfaces running together when a PostgreSQL test database is available.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Auth guard redirects protected routes without a Better Auth cookie and allows requests with a session cookie. |
| Integration | API status and Better Auth mounting remain available through existing package tests. |
| E2E | Sign up, reach dashboard, see user email, sign out, and return to sign-in. |
| Platform | `pnpm dev` still starts app and API surfaces. |
| Performance | Not required for this slice. |
| Logs/Audit | API request logging remains unchanged; product audit is deferred. |

## Fixtures

- E2E user email generated per run: `auth-smoke-<timestamp>@example.com`.
- Password: `Password123!`.

## Commands

```text
pnpm check
pnpm check-types
pnpm test
pnpm test:e2e
pnpm boundaries
```

## Acceptance Evidence

- `pnpm check` passed.
- `pnpm check-types` passed for all 25 Turbo tasks.
- `pnpm test` passed for all 25 Turbo tasks, including all three `@repo/auth` guard tests.
- `pnpm boundaries` passed outside the sandbox after `tsx` IPC was blocked by sandbox restrictions.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm db:push` synchronized
  the Better Auth schema and generated Prisma Client.
- Browser-plugin smoke passed sign-up, authenticated dashboard identity, reload persistence, and sign-out with no console
  errors.
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm test:e2e` passed both
  Chromium desktop and Pixel 7 mobile projects (`2 passed`).
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm build` passed all eight
  production build tasks outside the sandbox.
- Tailwind v4 PostCSS processing is configured per app, and Biome accepts the shared stylesheet's `@source` directives.
