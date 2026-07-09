# US-029 Generated Project Consistency Hardening

## Status

implemented

## Lane

normal

## Product Contract

Fresh generated projects should be immediately usable without source-only
template catalog artifacts, stale lockfiles, misleading feature flags, broken
marketing links, or weak workspace boundary rules.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`

## Acceptance Criteria

- Generated projects remove template catalog files and do not export removed
  template modules.
- Generated `featureConfig` reflects the selected app surfaces.
- Marketing navigation hides docs and pricing links unless their backing
  features are enabled.
- Generated `.dockerignore` and `.repomixignore` omit source Harness/internal
  cleanup noise and keep tests plus CI visible to AI/code-review tooling.
- `--skip-install` output does not keep a source lockfile after app surfaces are
  removed.
- Boundary enforcement fails for package workspaces missing explicit
  `packageRules` and for cross-workspace relative imports.

## Design Notes

- Commands: `pnpm boilerplate:init`, `pnpm boundaries`, `pnpm release:check`.
- Queries: none.
- API: none.
- Tables: none.
- Domain rules: reusable boilerplate source may keep template catalog code;
  generated projects should not keep source-only template tooling.
- UI surfaces: marketing nav uses feature/app config instead of hard-coded Docs
  and Pricing links.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-029 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | Generator and boundary engine tests pass. |
| Integration | `pnpm boundaries` passes against the real workspace. |
| E2E | Not required for generator/policy hardening. |
| Platform | Generated-project release ladder or source release ladder passes. |
| Release | `pnpm release:check` passes. |

## Harness Delta

None expected.

## Evidence

- `pnpm exec vitest run scripts/boilerplate-init/generator.test.ts scripts/boundaries/boundary-engine.test.ts` passed 2 files / 4 tests.
- `pnpm check:ci` passed across 300 files.
- `pnpm boundaries` passed against the real workspace after converting email previews to `@repo/mail/templates`.
- `pnpm check-types` passed 25 workspace typecheck tasks.
- `pnpm release:check` passed template validation, Ultracite, typechecks,
  tests, boundaries, and 9 build tasks.
