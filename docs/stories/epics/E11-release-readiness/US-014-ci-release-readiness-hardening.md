# CI and Release Readiness Hardening

## Status

implemented

## Lane

normal

## Product Contract

CI and local release checks should catch template catalog drift before a fork,
PR, or reusable boilerplate promotion reaches normal lint, type, test, package
boundary, and build validation.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `README.md`

## Acceptance Criteria

- CI runs template catalog validation as a first-class validation step.
- A local release command runs template drift validation plus the standard
  non-E2E validation ladder.
- Product and deployment docs describe the CI/local release contract.
- Harness story evidence records the command proof.

## Design Notes

- Commands: root `pnpm release:check` composes `templates:validate`, Biome,
  typecheck, tests, package boundaries, and build.
- Boundaries: root `pnpm boundaries` uses Node 22 type stripping directly so
  release checks do not depend on `tsx` IPC behavior.
- CI: `.github/workflows/ci.yml` runs `pnpm templates:validate` after database
  setup and before lint/type/test/build.
- E2E: browser E2E remains a local opt-in via `pnpm test:e2e:db`; promote it
  to CI only when runtime budget is accepted.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm templates:validate` |
| Integration | `pnpm check:ci`, `pnpm check-types`, `pnpm test`, `pnpm boundaries` |
| E2E | Not required for this release-hardening slice |
| Platform | `pnpm build`; CI workflow includes template validation |
| Release | `pnpm release:check` |

## Harness Delta

US-014 records release-readiness hardening after the core boilerplate stories
reached implemented status.

## Evidence

- `pnpm templates:validate` passed.
- `pnpm check:ci` passed.
- First `pnpm release:check` attempt proved templates, Biome, typecheck, and
  tests, then exposed `tsx` IPC sandbox failure in `pnpm boundaries`.
- `pnpm boundaries` passed after moving the script to Node 22 type stripping.
- Second sandboxed `pnpm release:check` proved templates, Biome, typecheck,
  tests, and boundaries, then failed only at `apps/docs` Turbopack build because
  sandbox blocked process/port binding.
- Escalated `pnpm release:check` passed end-to-end: templates, Biome,
  typecheck, tests, boundaries, and build.
