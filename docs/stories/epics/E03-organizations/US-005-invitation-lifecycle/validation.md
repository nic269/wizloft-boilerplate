# US-005 Validation

## Proof Strategy

Prove token/state invariants in unit tests, HTTP authorization and validation in API tests, atomic transitions against
PostgreSQL, and the user journey in Playwright.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Token hashing, create/revoke/accept state and audit operations |
| Integration | Permission enforcement, API errors, mail fallback, PostgreSQL transition smoke |
| E2E | Owner invites; invited user signs up or signs in; invitation is accepted |
| Platform | Production build |
| Performance | Not required for bounded onboarding writes |
| Logs/Audit | Created, revoked, and accepted actions contain no token plaintext |

## Fixtures

- Owner and invited user with separate emails.
- Organization with Owner and Member roles.

## Commands

```text
pnpm --filter @repo/auth test
pnpm --filter @repo/api test
pnpm check
pnpm check-types
pnpm test
pnpm boundaries
pnpm test:e2e
pnpm build
```

## Acceptance Evidence

- `pnpm --filter @repo/auth test`: 4 files, 12 tests passed.
- `pnpm --filter @repo/api test`: 1 file, 7 tests passed.
- `pnpm check`: 174 files passed.
- `pnpm check-types`: 24 tasks passed.
- `pnpm test`: 24 tasks passed.
- `pnpm boundaries`: passed.
- `pnpm build`: 8 tasks passed; invitation, members, sign-in, and sign-up routes compiled.
- `pnpm test:e2e`: Chromium and Pixel 7 auth plus invitation journeys passed, 4 tests total. The invitation journey
  exercised organization creation, invitation delivery fallback, isolated member signup, callback return, acceptance,
  and membership-scoped organization visibility against PostgreSQL.
- The standalone PostgreSQL lifecycle smoke command was not run because the execution approval quota rejected it before
  startup. Browser E2E supplied real database proof for create and accept; revoke remains covered by transaction unit and
  authorization contract tests.
