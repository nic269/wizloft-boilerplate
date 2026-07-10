# US-036: Complete E2E And Docker Runtime Proof

## Current Behavior

E2E can reuse stale Compose state, Next standalone config does not explicitly
trace the monorepo root, and runner images do not prove public assets are copied.

## Target Behavior

- Every E2E run owns and removes its database project/volume.
- App and web standalone output trace from the repo root.
- Runner images contain public assets.
- Portable app/API/web runtime proof remains one command.

## Affected Users

- Maintainers validating forks and deployment operators.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/release-readiness.md`

## Non-Goals

- Adding browser E2E to CI without an accepted runtime budget.
- Adding hosting-platform-specific checks.
