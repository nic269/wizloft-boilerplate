# Design

## Domain Model

`@repo/access-control` contains immutable permission definitions and derived
policy helpers. `@repo/auth` owns stateful authorization against users,
memberships, roles, and persisted role permissions.

## Application Flow

- Organization and invitation services use shared Owner and Member presets.
- Role creation normalizes arbitrary input against the shared catalog.
- API validation rejects unknown pairs through the shared guard.
- Access settings render labels and submit pairs from the shared catalog.
- Database seed creates Owner, Admin, Member, and Viewer roles from shared
  presets.

## Interface Contract

Existing permission pairs, API routes, request bodies, response bodies, and
authorization outcomes remain unchanged. `@repo/auth/access-control` keeps
compatibility re-exports while new code imports static policy from
`@repo/access-control`.

## Data Model

No migration. New seed runs no longer create `members:update` or `settings:*`
permissions because those pairs were never part of the accepted catalog.

## UI / Platform Impact

The access screen is visually unchanged. Labels and default checkbox selection
now come from the shared package.

## Observability

Existing role and membership audit records remain unchanged.

## Alternatives Considered

See `docs/decisions/0014-central-access-control-policy.md`.
