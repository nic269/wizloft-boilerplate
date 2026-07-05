# Exec Plan

## Goal

Complete the organization/RBAC/audit slice with a small but real role-management and audit-viewer workflow.

## Scope

In scope:

- Permission catalog owned by the auth package.
- Owner baseline permissions for roles and audit.
- Hono routes for roles, members, member role assignment, and audit logs.
- Next.js settings UI for access management.
- Unit and API tests covering tenant boundaries and authorization gates.

Out of scope:

- Role deletion and mutation after creation.
- Email verification enforcement beyond the existing invitation exact-email check.
- Provider-specific permissions.

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
2. Design.
3. Validation planning.
4. Implementation.
5. Verification.
6. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Existing membership data requires a destructive migration.
- Role deletion or owner self-demotion policy is required.
- Validation requirements need to be weakened.

