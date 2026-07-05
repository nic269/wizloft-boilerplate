# US-005 Exec Plan

## Goal

Add a secure, auditable invitation and member onboarding flow.

## Scope

In scope:

- Invitation create/list/revoke/accept services and API routes.
- RBAC enforcement and Member role provisioning.
- Optional mail delivery and acceptance UI.
- Unit, API, database, and browser validation.

Out of scope:

- Custom roles, member removal, and email-verification delivery.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Data model usage.
- Audit/security.
- External mail provider.
- Public API behavior.
- Existing behavior.

Hard gates:

- Auth and authorization boundary.
- External provider behavior.

## Work Phases

1. Define invitation state and authorization invariants.
2. Implement transactional domain operations.
3. Add protected Hono routes and optional mail delivery.
4. Add member management and acceptance UI.
5. Verify tests, database behavior, browser flow, and production build.
6. Record Harness evidence.

## Stop Conditions

Pause if token plaintext must be persisted, acceptance can bypass email matching, or validation requires destructive data
changes.

