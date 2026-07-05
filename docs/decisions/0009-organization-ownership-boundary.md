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

## Alternatives Considered

1. Use the Better Auth organization plugin as the source of truth. Deferred to keep the existing vendor-independent
   Prisma RBAC contract.
2. Treat every authenticated user as able to list all organizations. Rejected because it violates tenant isolation.

## Consequences

Positive:

- Tenant access has an explicit, testable ownership boundary.
- New organizations cannot exist without an initial administrator.
- Security-sensitive creation has durable audit evidence.

Tradeoffs:

- The boilerplate owns organization lifecycle logic alongside Better Auth.
- Custom roles and invitation lifecycle require later stories.

## Follow-Up

- Add invitation creation, acceptance, revocation, and member management.
