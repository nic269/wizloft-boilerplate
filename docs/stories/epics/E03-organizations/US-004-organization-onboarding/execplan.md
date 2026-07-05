# US-004 Exec Plan

## Goal

Deliver the first secure organization/RBAC/audit vertical slice.

## Scope

In scope:

- Membership-scoped organization listing.
- Transactional organization creation with an Owner role and audit record.
- Dashboard onboarding UI.
- Unit and API contract tests.

Out of scope:

- Invitations, member management, and custom roles.

## Risk Classification

Risk flags:

- Authorization.
- Data model usage.
- Audit/security.
- Public API behavior.
- Existing behavior.

Hard gates:

- Authorization boundary.
- Public API behavior.

## Work Phases

1. Define ownership and permission invariants.
2. Implement the transactional organization service.
3. Protect and validate the API routes.
4. Add dashboard onboarding.
5. Verify unit, integration, type, lint, boundary, and build checks.
6. Record Harness evidence.

## Stop Conditions

Pause if the implementation requires a destructive migration, weakens session validation, or changes the accepted
app/package deployment boundary.

