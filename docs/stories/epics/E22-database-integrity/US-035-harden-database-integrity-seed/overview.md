# US-035: Harden Database Integrity And Seed Reconciliation

## Current Behavior

Several operational queries lack indexes, provider event identifiers are not
unique, global feature flags can duplicate because nullable PostgreSQL values
are distinct, invitation role ids can dangle, and rerunning seed does not apply
permission catalog changes.

## Target Behavior

- Required indexes and provider uniqueness constraints exist.
- Feature flags use required global/organization scope keys.
- Invitation roles use a database relation.
- System roles are explicit and seed reconciles their permissions.
- A clean project can apply an initial production migration.

## Affected Users

- Maintainers, deployment operators, and access-control users.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/release-readiness.md`

## Non-Goals

- Migrating an existing product database automatically.
- Building a feature-flag management UI.
