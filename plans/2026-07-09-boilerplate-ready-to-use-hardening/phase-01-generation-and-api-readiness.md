# Phase 01: Generation And API Readiness

## Status

Done.

## Completed Stories

- `US-029` Generated project consistency hardening.
- `US-030` Real API readiness.

## Acceptance Criteria

- Generated projects remove internal Harness and source-only template catalog
  artifacts.
- Generated feature flags match selected app surfaces.
- Generated ignore files keep tests and CI visible to review tooling.
- API `/health` remains a cheap process liveness check.
- API `/ready` verifies database connectivity and returns 503 when the service
  should not receive traffic.

## Validation Evidence

- `pnpm --filter @repo/api test`
- `pnpm --filter @repo/api check-types`
- `pnpm check:ci`
- `pnpm check-types`
- `pnpm boundaries`
- `pnpm release:check`
- `scripts/bin/harness-cli story verify US-029`
- `scripts/bin/harness-cli story verify US-030`

## Rollback Notes

Revert only the story-specific code and docs for the affected story. Do not
revert unrelated working tree changes or Harness records from other slices.
