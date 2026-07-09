# Design

## Domain Model

The boilerplate treats `Owner` as the baseline organization ownership role. A
valid organization must have at least one active membership linked to an Owner
role.

This story does not introduce a new role system flag. The current generic data
model remains enough because the initial invariant only needs to protect the
accepted baseline `Owner` role name inside one organization.

## Application Flow

`updateMemberRole` keeps the existing flow:

1. Resolve the target role inside the organization.
2. Resolve the target active membership and its current role.
3. If the membership currently has the `Owner` role and the target role is not
   `Owner`, count active Owner memberships in the same organization excluding
   the target membership.
4. Reject the update when no other active Owner exists.
5. Update the membership role.
6. Write `member.role_updated` audit evidence only after the update succeeds.

## Interface Contract

The existing route remains:

- `PATCH /api/organizations/:organizationId/members/:membershipId/role`

Errors:

- Missing target role or membership still returns 404.
- Last-owner demotion returns 409 with code `CONFLICT`.

## Data Model

No migration. Existing `Role` and `Membership` relations are queried inside the
same Prisma transaction that performs the update.

## UI / Platform Impact

The current access settings UI already surfaces API errors. No new UI control is
needed for this slice.

## Observability

Successful role updates continue to write `member.role_updated`. Rejected
last-owner updates do not write audit records because no product mutation
occurred.

## Alternatives Considered

1. Add a `Role.isSystem` or `Role.kind` column now. Deferred because the current
   blocker is ownership preservation, not role lifecycle management.
2. Allow last-owner demotion when the actor is not self-demoting. Rejected
   because it can still leave the organization without an administrator.
3. Move ownership to a separate organization owner column. Rejected because the
   accepted model stores organization authority through memberships and roles.
