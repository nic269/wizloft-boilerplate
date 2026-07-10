# 0017 Scoped Job and Integration Identity

Date: 2026-07-10

## Status

Accepted

## Context

Job idempotency was global across tenants and nullable integration uniqueness did
not cover global connections in PostgreSQL.

## Decision

Job idempotency uses a non-null canonical `scopeKey`, with `global` as the
default and `organization:<id>` for organization work. Global integration
provider identities use a partial unique index; tenant ownership remains solely
in `organizationId`, and connections without an external identity may coexist
while they are being configured.

Tenant integration ownership is enforced by a foreign key to Organization with
delete cascade. A deleted tenant connection must never become a global
connection implicitly.

## Alternatives Considered

1. Nullable organization scope does not enforce global idempotency uniqueness.
2. A second integration scope field duplicates ownership and can drift.
3. Requiring external identity during initial setup is too restrictive for a generic boilerplate.

## Consequences

Positive:

- Different tenants cannot suppress each other's jobs.
- Stable global provider identities are database-enforced.

Tradeoffs:

- Job callers must use the canonical scope helper for tenant work.

## Follow-Up

- Require an external identity before a future integration enters an active state.
