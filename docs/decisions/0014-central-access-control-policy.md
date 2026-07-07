# 0014 Central Access-Control Policy

Date: 2026-07-07

## Status

Accepted

## Context

The permission catalog and role defaults lived in the database-backed auth
service, while the access UI duplicated labels and permission pairs and the
database seed used additional permission strings that the API rejected.

## Decision

Create a dependency-free, browser-safe `@repo/access-control` package as the
only source of truth for permission definitions, keys, validation,
normalization, UI defaults, and baseline role presets.

`@repo/auth` retains database-backed membership and permission evaluation. It
may re-export policy helpers from its existing access-control entrypoint for
compatibility, but it does not own duplicate policy data. API validation, app
UI, organization/invitation provisioning, and database seed workflows consume
the shared package directly where appropriate.

## Alternatives Considered

1. Keep the catalog in auth and expose a browser-safe auth subpath. Rejected
   because static policy is not authentication infrastructure.
2. Put the catalog in config. Rejected because authorization policy deserves a
   named boundary.
3. Keep UI and seed copies with drift tests. Rejected because tests would
   police avoidable duplication instead of removing it.

## Consequences

Positive:

- Auth, API, UI, provisioning, and seed workflows share one vocabulary.
- The browser imports no Prisma or Better Auth code for permission labels.
- Seeded roles cannot contain unknown permissions.

Tradeoffs:

- One additional workspace package is part of the core dependency graph.
- Changing a permission or preset remains an explicit code and review event.

## Follow-Up

- Keep product-specific entitlements outside this package until a real product
  defines their semantics.
