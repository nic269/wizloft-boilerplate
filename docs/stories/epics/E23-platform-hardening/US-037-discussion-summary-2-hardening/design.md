# Design

## Domain Model

Auth feature requirements determine delivery-provider requirements. System roles
are reconciled from the access-control catalog. Job idempotency is namespaced by
a canonical scope key. Integration identity remains nullable during setup but
is unique once a provider identity exists.

## Application Flow

Signup enters email verification, development delivery writes a private outbox,
and verification resumes a safe callback. API startup and readiness evaluate the
same provider policy. List queries use deterministic cursor pagination.

## Interface Contract

- Remove `/rpc/health.get`, `/rpc/ready.get`, and `/rpc/status.get`.
- Add cursor and limit inputs to organization list procedures.
- Return `{ data, pageInfo: { nextCursor } }` for paginated lists.
- Make job provider run queries asynchronous.

## Data Model

- Add a partial unique index for pending invitation email per organization.
- Add a partial unique index for global integration provider identity.
- Add and backfill `JobRun.scopeKey`; replace global idempotency uniqueness.

## UI / Platform Impact

The authenticated app is non-indexable. Signup, invitation, members, roles, and
audit UI move with the new contracts. Production readiness includes required
providers.

## Observability

Development outbox writes log an id/path without exposing content. Readiness
reports provider requirement and health state.

## Alternatives Considered

1. A public `/dev/mail` endpoint was rejected because auth links are credentials.
2. `Promise.race` timeout was rejected because it cannot cancel side effects.
3. A duplicate integration scope field was rejected in favor of partial indexes.
4. A second Zod manifest schema was rejected in favor of the tracked JSON Schema.
