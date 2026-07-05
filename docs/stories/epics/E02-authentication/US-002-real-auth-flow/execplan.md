# Exec Plan

## Goal

Make the boilerplate's default email/password auth path functional end to end.

## Scope

In scope:

- Better Auth sign-in and sign-up form actions from `apps/app`.
- Server-side session lookup for protected pages.
- Sign-out action from the authenticated shell.
- Auth guard tests and browser smoke test coverage.
- Harness story and validation evidence updates.

Out of scope:

- Organization creation after signup.
- Role or invite workflows.
- Provider email delivery and password reset.
- Production rate-limit tuning.

## Risk Classification

Risk flags:

- Auth.
- Public contracts.
- Cross-platform browser behavior.
- Weak proof.

Hard gates:

- Auth.

## Work Phases

1. Discovery of existing auth/API/app wiring.
2. Story and validation planning.
3. Implement auth forms and session-aware dashboard.
4. Add focused tests.
5. Run checks and record evidence.
6. Update Harness trace.

## Stop Conditions

Pause for human confirmation if:

- The story requires schema changes beyond Better Auth's existing user/session/account tables.
- E2E proof requires weakening auth behavior.
- Organization onboarding becomes required for sign-up completion.
