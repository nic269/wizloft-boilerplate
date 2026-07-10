# Phase 05: E2E And Docker Runtime Completeness

## Status

Implemented as `US-036`.

## Goal

Keep runtime proof strong enough for project forks without overloading local or
CI feedback loops.

## Candidate Stories

- Improve deterministic E2E database lifecycle if repeated flake or lifecycle
  drift appears.
- Validate Docker public assets and Next output tracing roots.
- Decide whether browser E2E should stay local-only or become a CI gate.

## Risk

Normal by default. Escalate to high-risk if runtime contracts, public API
behavior, deployment images, or validation requirements change broadly.

## Files To Inspect First

- `scripts/e2e/**`
- `tests/e2e/**`
- `scripts/docker/**`
- `Dockerfile`
- `.github/workflows/**`
- `docs/deployment.md`

## Validation

- `pnpm test:e2e:db`
- `pnpm docker:validate`
- `pnpm release:check`

## Pause Points

- Confirm CI runtime budget before promoting browser E2E into pull request
  checks.
- Confirm the target deployment platform before adding platform-specific image
  assertions.

## Outcome

- E2E uses an isolated Compose project, force-reset schema, and guaranteed
  container/volume cleanup.
- App and web standalone builds trace from the monorepo root and copy public
  assets into runner images.
- Browser E2E stays local-only; portable Docker validation covers app/API/web
  without choosing a hosting platform.
