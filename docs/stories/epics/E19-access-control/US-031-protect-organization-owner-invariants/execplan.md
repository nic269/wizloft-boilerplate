# Exec Plan

## Goal

Prevent organization role changes from removing the final active Owner
membership.

## Scope

In scope:

- Stateful auth service invariant for member role updates.
- API conflict mapping for the last-owner guard.
- Focused auth and API tests.
- Product docs, release readiness, decision, story, and Harness evidence.

Out of scope:

- Role deletion or role editing.
- Suspended-user enforcement.
- Email verification or password reset hardening.
- Schema migration for system-role metadata.

## Risk Classification

Risk flags:

- Authorization.
- Audit/security.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- Authorization.
- Audit/security.

## Work Phases

1. Discovery.
2. Story and decision updates.
3. Service invariant.
4. API error mapping.
5. Focused tests.
6. Release validation.
7. Harness update.

## Stop Conditions

Pause for human confirmation if:

- The invariant requires a schema migration.
- Existing tests prove a different accepted owner-transfer behavior.
- Validation requirements need to be weakened.
