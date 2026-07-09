# 0009 Organization Ownership Boundary

Date: 2026-07-05

## Status

Accepted

## Context

The scaffold contains generic organization and RBAC tables, but the existing organization route lists every tenant and
there is no invariant connecting a newly created organization to its creator.

## Decision

Organization access is membership-scoped. Creating an organization atomically creates a per-organization Owner role,
baseline permissions, an active creator membership, and an `organization.created` audit record. API routes resolve the
current Better Auth session and never accept a user id from request input.

Role assignment must preserve ownership. Updating a member role is rejected when
the update would leave the organization without at least one active membership
linked to the `Owner` role.

## Alternatives Considered

1. Use the Better Auth organization plugin as the source of truth. Deferred to keep the existing vendor-independent
   Prisma RBAC contract.
2. Treat every authenticated user as able to list all organizations. Rejected because it violates tenant isolation.

## Consequences

Positive:

- Tenant access has an explicit, testable ownership boundary.
- New organizations cannot exist without an initial administrator.
- Existing organizations cannot lose their final active Owner through role
  assignment.
- Security-sensitive creation has durable audit evidence.

Tradeoffs:

- The boilerplate owns organization lifecycle logic alongside Better Auth.
- The boilerplate treats `Owner` as the protected baseline role name until a
  future story introduces explicit system-role metadata.

## Follow-Up

- Add explicit system-role metadata only when role deletion or permission
  mutation requires it.
