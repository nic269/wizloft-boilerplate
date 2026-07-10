# Phase 2: Authorization, Feature, and API Contracts

## Changes

- Require an active system Owner or active super admin for changes into or out
  of the system Owner role.
- Make password reset, email verification, and organization invitation flags
  gate actual server, API, page, and UI behavior.
- Replace misleading deployable-surface flags with `appSurfaces` ownership.
- Constrain permission and membership/invitation statuses in API contracts.

## Validation

- Authorization and feature-toggle unit/API tests.
- OpenAPI contract tests for exact permission pairs and enums.
- Generator tests for selected app surfaces.

## Risks and Rollback

- Owner policy intentionally removes Admin self-escalation.
- Disabled feature routes retain their API contract but return `404` at runtime.

