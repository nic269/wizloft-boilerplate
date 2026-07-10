# Design

## Domain Model

Provider status retains `configured` for compatibility and adds `state` with
`disabled`, `configured`, or `misconfigured`. Diagnostic messages name missing
variables but never include values.

## Application Flow

Mail resolves an explicit `MAIL_PROVIDER` first, then infers Resend or SMTP from
present configuration. Storage uses `STORAGE_PROVIDER`. Package assertions
throw only in production for a misconfigured provider; development falls back
for easier local work. The API calls both assertions before starting Hono.

## Interface Contract

`/ready` keeps database-only readiness semantics and exposes the richer provider
status objects. Mail supports console, Resend, and SMTP delivery.

## Data Model

No persisted-data changes.

## UI / Platform Impact

Production startup fails with actionable missing-variable names. Docker smoke
proves partial Resend and S3 configuration cannot accept traffic.

## Observability

Startup errors and `/ready` diagnostics reveal provider/state only, never
credentials.

## Alternatives Considered

1. Make every missing optional provider fatal. Rejected because the core must
   remain runnable without integrations.
