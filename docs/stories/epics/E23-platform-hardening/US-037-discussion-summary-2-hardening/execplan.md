# Exec Plan

## Goal

Implement all accepted points in `discussion-summary-2.md` with durable proof.

## Scope

In scope:

- Auth verification, mail branding/outbox/requirements, crawler policy.
- Role, invitation, integration, and job invariants.
- Provider readiness and truthful provider contracts.
- Manifest validation, legacy RPC removal, and pagination.

Out of scope:

- Real provider credentials or provider-specific business workflows.
- Backward compatibility for deprecated RPC endpoints.

## Risk Classification

Risk flags:

- Auth, data model, external systems, public contracts, existing behavior,
  multi-domain.

Hard gates:

- Auth, external provider behavior, and database migration.

## Work Phases

1. Auth and mail.
2. Organization and data integrity.
3. Provider and jobs contracts.
4. API and generator contracts.
5. Integrated verification and Harness update.

## Stop Conditions

Pause if migration inspection finds destructive cleanup, required verification
cannot preserve invitation callbacks, or validation would need to be weakened.
