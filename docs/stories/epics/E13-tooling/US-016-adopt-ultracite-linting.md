# Adopt Ultracite Linting Configuration

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate should use the same Ultracite-on-Biome linting pattern as
next-forge where it improves monorepo discipline, while removing unused shared
configuration packages that add maintenance cost without consumers.

## Relevant Product Docs

- `README.md`
- `docs/product/boilerplate-platform.md`

## Acceptance Criteria

- Root check scripts use Ultracite commands.
- Biome config extends Ultracite's core, React, and Next presets.
- Unused `@repo/biome-config` package is removed.
- Repository formatting is normalized by Ultracite's Biome preset.
- Release validation still passes.

## Design Notes

- Commands: `pnpm check`, `pnpm check:ci`.
- Tooling: Ultracite wraps Biome and ships reusable rule presets.
- Scope: no app behavior changes.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm check:ci` |
| Integration | `pnpm check-types`, `pnpm test`, `pnpm boundaries` |
| E2E | Not required |
| Platform | `pnpm build` |
| Release | `pnpm release:check` |

## Harness Delta

US-016 records the tooling migration decision after comparing against
next-forge.

## Evidence

- `pnpm exec ultracite check --max-diagnostics=200` passed after migrating
  scripts, shared packages, tests, and app code to the Ultracite rule profile.
- `pnpm check`, `pnpm check:ci`, `pnpm check-types`, `pnpm test`,
  `pnpm boundaries`, and `pnpm build` passed.
- Sandboxed `pnpm release:check` passed through templates, Ultracite, typecheck,
  tests, and boundaries, then failed at Turbopack CSS processing because the
  sandbox denied helper process port binding. Escalated `pnpm release:check`
  passed end-to-end.
