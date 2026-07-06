# US-018 Populate Shadcn Base UI Components

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate design-system package should provide the complete shadcn UI
component set using Base UI primitives so new projects can compose product
surfaces without repeating component installation and primitive migration.

## Relevant Product Docs

- `README.md`
- `docs/product/boilerplate-platform.md`

## Acceptance Criteria

- Shadcn CLI resolves the design-system workspace through package-local aliases.
- All currently available shadcn UI components are installed in the shared package.
- Generated primitive components use Base UI rather than Radix UI.
- Existing `@repo/design-system` imports remain compatible.
- Direct Radix dependencies are removed when no source files consume them.
- Repository checks and production builds pass.

## Design Notes

- UI components live in `packages/design-system/src/components/ui`.
- Existing composed components remain outside the generated UI directory.
- Package-local `#components`, `#hooks`, and `#lib` imports let generated source
  resolve consistently without exposing internal source paths to applications.
- Existing root exports remain the stable application-facing contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Shadcn inventory and design-system typecheck |
| Integration | `pnpm check:ci`, `pnpm check-types`, `pnpm boundaries` |
| E2E | Existing app E2E behavior remains covered by the release ladder |
| Platform | `pnpm build` |
| Release | `pnpm release:check` |

## Harness Delta

Record the generated component inventory and Base UI migration evidence for
future dependency upgrades.

## Evidence

- Shadcn `info --json` reports `style: base-nova`, `base: base`, and no
  previously installed generated components before generation.
- Shadcn `add --all --dry-run` resolved 61 source files and 11 dependencies.
- Shadcn `add --all` created 60 UI modules plus the shared `use-mobile` hook.
- Direct Radix dependencies and source imports were removed.
- Production CSS contains Base UI state selectors and
  `--accordion-panel-height` animation output.
- `pnpm check:ci`, `pnpm check-types`, `pnpm test`, and `pnpm boundaries`
  passed.
- Sandboxed build reached CSS processing but Turbopack could not bind its
  helper port; escalated `pnpm build` passed all eight build tasks.
