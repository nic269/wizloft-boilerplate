# Validation

## Proof Strategy

The first scaffold is done when installation and repo-wide quick checks can run, type checking covers all packages/apps,
and dev servers can start.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | helpers, API health route, logger, provider interface tests |
| Integration | Prisma and Better Auth after database is available |
| E2E | app sign-in/dashboard smoke after auth actions are completed |
| Platform | `pnpm dev` starts app/api/web/docs/email/storybook |
| Performance | Not required for initial scaffold |
| Logs/Audit | API request log and audit model present |

## Fixtures

- Default organization seed.
- Default org roles: Owner, Admin, Member, Viewer.

## Commands

```text
pnpm install
pnpm check
pnpm check-types
pnpm test
pnpm boundaries
pnpm dev
```

## Acceptance Evidence

- `pnpm install` passed after dependency build approval.
- `pnpm db:generate` passed with Prisma 6.19.x.
- `pnpm check` passed.
- `pnpm check-types` passed for all 25 Turbo tasks.
- `pnpm test` passed for all 25 Turbo tasks.
- `pnpm boundaries` passed.
- `pnpm dev` smoke started:
  - `apps/app` on `http://localhost:3000`
  - `apps/web` on `http://localhost:3001`
  - `apps/api` on `http://localhost:3002`
  - `apps/docs` on `http://localhost:3003`
  - `apps/email` on `http://localhost:3004`
  - `apps/storybook` on `http://localhost:6006`
