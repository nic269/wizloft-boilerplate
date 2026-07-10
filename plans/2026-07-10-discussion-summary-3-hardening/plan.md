# Discussion Summary 3 Hardening

Status: implemented with external runtime evidence gaps

## Phases

1. [Database lifecycle and integrity](phase-01-database-lifecycle-and-integrity.md)
2. [Authorization, feature, and API contracts](phase-02-authorization-feature-and-api-contracts.md)
3. [Runtime polish and verification](phase-03-runtime-polish-and-verification.md)

## Dependencies

- Intake #49 and story US-038.
- Owner-boundary policy confirmed by the user on 2026-07-10.
- PostgreSQL, browser, and Docker proof run only when Harness reports the
  corresponding capability as present.

## Acceptance Criteria

- Fresh setup, CI, generated projects, and isolated E2E use migrations.
- Concurrent Owner demotions cannot leave an organization without an Owner.
- Only a system Owner or active super admin can cross the Owner role boundary.
- Auth feature switches disable their server, route, page, and UI behavior.
- Integration ownership, invitation expiry, and API enums are database/runtime
  enforced.
- Surface URLs, invitation email, request IDs, README, and environment guidance
  match production behavior.
- Focused tests, source release checks, generated-project checks, and all
  equipped runtime checks pass.
