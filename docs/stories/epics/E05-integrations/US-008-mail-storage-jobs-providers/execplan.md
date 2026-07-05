# Exec Plan

## Goal

Make mail, storage, and jobs packages usable as generic provider boundaries without requiring optional credentials.

## Scope

In scope:

- Mail provider status.
- S3/R2-compatible storage provider and local fallback when S3 env is incomplete.
- Tenant object key sanitizer.
- Local job provider run records, retry, idempotency, and idle wait.
- API status surfaces for storage and jobs.
- Unit and API tests.

Out of scope:

- Live provider integration tests.
- Persistent job tables or worker deployment topology.
- Product-specific file upload/download UI.

## Risk Classification

Risk flags:

- External systems.
- Public contracts.
- Existing behavior.
- Weak proof.

Hard gates:

- External provider behavior.

## Work Phases

1. Discovery.
2. Design.
3. Validation planning.
4. Implementation.
5. Verification.
6. Harness update.

## Stop Conditions

Pause for human confirmation if:

- New provider credentials are required.
- Durable queue schema/migrations become necessary.
- Validation would require weakening existing checks.

