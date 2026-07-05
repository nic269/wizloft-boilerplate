# Design

## Domain Model

Provider packages expose small contracts:

- Mail provider status: provider, configured flag, and mode.
- Storage provider status: provider, configured flag, and durability mode.
- Job run records: run ID, name, status, attempts, optional idempotency key, and timestamps.

## Application Flow

Mail:

- Missing Resend credentials select console delivery.
- Resend credentials select Resend and report sender readiness.

Storage:

- Local and memory providers work without external credentials.
- S3/R2 provider is selected only when bucket, region, access key, and secret key are present.
- Incomplete S3/R2 env reports `configured: false` and falls back to local storage for local development.

Jobs:

- Definitions are registered by name.
- Enqueue creates a run record unless an idempotency key already exists.
- Handler failures retry according to the definition, then record final failure.

## Interface Contract

- `getMailProviderStatus()`
- `getStorageProviderStatus()`
- `getJobProviderStatus()`
- `GET /api/files`
- `GET /api/jobs`

## Data Model

No schema changes. Local job run records are in-memory only.

## UI / Platform Impact

No browser UI changes. API status routes remain machine-readable smoke surfaces.

## Observability

Mail console delivery logs recipient and subject through the shared logger. Job run records expose failure messages for
local tests and development.

## Alternatives Considered

1. Require real cloud credentials before enabling storage. Rejected because the boilerplate must run locally by default.
2. Add database-backed jobs now. Deferred until a product needs durable cross-process queues.

