# US-024 Validation

## Proof Strategy

Use Playwright against the real Next.js, Hono, Better Auth, Prisma, and
PostgreSQL stack. Keep lower-level workspace tests and production builds as
regression proof.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Existing auth, access-control, API, and helper suites remain green |
| Integration | PostgreSQL schema bootstrap and real application servers |
| E2E | Auth lifecycle; organization onboarding and tenant isolation; invitation signup and acceptance |
| Platform | Desktop Chrome and Pixel 7; repository release ladder |
| Performance | Not required for bounded smoke journeys |
| Logs/Audit | Existing service tests remain the audit-record proof |

## Fixtures

- Unique owner, isolated user, and invited-member emails per Playwright case.
- Unique organization names per case.
- Separate browser contexts for distinct authenticated sessions.
- Disposable PostgreSQL database started by the E2E bootstrap runner.

## Commands

```text
pnpm test:e2e:db
pnpm check:ci
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

## Acceptance Evidence

- `pnpm test:e2e:db` selected an available PostgreSQL port, generated Prisma
  Client, pushed the schema, waited independently for API and app readiness,
  and passed 6/6 Playwright cases across Desktop Chrome and Pixel 7.
- Auth smoke proved signup, protected dashboard session rendering, and signout.
- Organization smoke used isolated browser contexts and proved each user could
  only see their own membership-scoped organization.
- Invitation smoke proved owner invitation creation, exact-email signup with
  callback return, acceptance, and resulting organization visibility.
- `pnpm release:check` passed: template catalog validation, Ultracite across
  297 files, 25/25 typecheck tasks, 25/25 workspace test tasks, workspace
  boundaries, and 9/9 production builds.
- The smoke suite uses two workers because six simultaneous cold Next.js
  navigations produced startup-only timeouts without adding product coverage.
