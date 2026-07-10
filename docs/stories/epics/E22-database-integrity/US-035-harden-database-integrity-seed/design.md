# Design

## Domain Model

Built-in organization roles carry `isSystem`. Feature flags use `scopeId`, with
`global` as the default and organization ids available to consuming projects.
Invitation role references are nullable and set null if a role is deleted.

## Application Flow

Organization/invitation flows mark built-in roles as system roles. Seed upserts
those roles, replaces their permission rows from `ROLE_PERMISSION_PRESETS`, and
does not touch custom roles.

## Interface Contract

No public API changes.

## Data Model

Adds invitation expiry/status, webhook status, and job status indexes; webhook
and integration provider uniqueness; role relation/system marker; scoped flag
uniqueness; and an initial Prisma migration.

## UI / Platform Impact

Production deploy can use `prisma migrate deploy`. Existing `db:push` databases
must be baselined manually before adopting migration history.

## Observability

Seed failures remain fatal and transactional.

## Alternatives Considered

1. PostgreSQL partial indexes for global flags. Rejected to keep generated
   projects portable within Prisma's normal migration model.
