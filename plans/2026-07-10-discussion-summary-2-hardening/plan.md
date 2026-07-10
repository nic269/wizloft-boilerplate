---
title: Discussion Summary 2 Hardening
description: Harden auth provider data generator and API contracts.
status: completed
priority: P0
effort: large
branch: main
tags: [auth, api, providers, database, generator]
created: 2026-07-10
---

# Discussion Summary 2 Hardening

Status: completed
Progress: 5/5 phases (100%)

## Goal

Close the auth, provider, data-integrity, generator, and API contract gaps accepted
from `discussion-summary-2.md` while keeping the boilerplate generic and
generated projects releasable.

## Phases

1. [Auth and mail](phase-01-auth-and-mail.md)
2. [Organization and data integrity](phase-02-organization-and-data-integrity.md)
3. [Provider and jobs contracts](phase-03-provider-and-jobs-contracts.md)
4. [API and generator contracts](phase-04-api-and-generator-contracts.md)
5. [Integrated verification](phase-05-integrated-verification.md)

## Dependencies

- Phase 1 feature requirements feed API readiness in phase 3.
- Phase 2 migrations must be generated before final database proof.
- Phase 4 pagination changes require app callers to move with the contract.

## Acceptance Criteria

- Unverified email/password users cannot enter authenticated product routes.
- Development auth mail is recoverable from a private filesystem outbox.
- Production readiness rejects missing providers required by enabled features.
- Organization system roles, pending invitations, integration identities, and
  job idempotency have database-backed invariants.
- Storage and job provider contracts describe their real runtime behavior.
- Init manifests are runtime validated against their JSON Schema.
- Legacy RPC routes are removed and list endpoints expose deterministic cursor
  pagination.
- Focused tests, database migration proof, generated-project validation, and
  `pnpm release:check` pass. Browser and Docker runtime checks run when their
  Harness capabilities are equipped; absent capabilities are recorded as clean
  skips rather than asserted proof.

## Rollback

Revert by phase. Database rollback must drop newly added partial indexes and the
job scope column only after confirming no new scoped rows depend on them.
