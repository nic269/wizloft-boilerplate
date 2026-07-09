# Exec Plan

## Goal

Make suspended users unable to access protected app and API surfaces through the
shared auth boundary.

## Scope

In scope:

- Shared session helper enforcement.
- Permission helper enforcement.
- Focused auth tests.
- API regression test using the shared session outcome.
- Product docs, release readiness, plan, story, and Harness evidence.

Out of scope:

- Admin status-management UI.
- Session row revocation.
- Better Auth sign-in flow customization.
- Email verification and password reset hardening.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- Auth.
- Authorization.

## Work Phases

1. Discovery.
2. Story packet.
3. Session helper guard.
4. Permission helper guard.
5. Focused tests.
6. Release validation.
7. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Enforcing suspension requires a database migration.
- Better Auth session internals need to be replaced.
- Validation requirements need to be weakened.
