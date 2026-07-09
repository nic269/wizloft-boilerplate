# US-013 Template Catalog And Validation

## Status

implemented

## Lane

normal

## Product Contract

Template tracks should be code-owned and discoverable from docs and CLI commands, without adding product-domain code to
the boilerplate core.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `templates/base/README.md`
- `templates/saas/README.md`
- `templates/education/README.md`
- `templates/dev-tools/README.md`
- `templates/shopify-addon/README.md`
- `templates/shopify-public-app/README.md`

## Acceptance Criteria

- A typed template catalog defines supported template tracks and their boundaries.
- Docs app renders template tracks from the shared catalog instead of a local hardcoded list.
- CLI commands can list, emit JSON, and validate template catalog drift.
- Validation catches missing template folders, missing README files, and uncataloged folders.
- No template adds DHL, brand, secret, or Shopify-specific workflow code to core.

## Design Notes

- Commands: `pnpm templates:list`, `pnpm templates:json`, `pnpm templates:validate`.
- Queries: no data queries added.
- API: no runtime API contract changes.
- Tables: no schema changes.
- Domain rules: template tracks stay descriptive; no product-domain behavior enters core.
- UI surfaces: docs app template section reads from `@repo/config/templates`.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-013 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | Config package tests cover catalog uniqueness, path alignment, and lookup. |
| Integration | Docs app typecheck proves shared catalog import. |
| E2E | Not required; docs rendering has no user workflow state. |
| Platform | `pnpm templates:validate`, `pnpm check:ci`, `pnpm check-types`, `pnpm test`, `pnpm boundaries`, and `pnpm build` pass. |
| Release | README and product docs mention template commands and catalog ownership. |

## Evidence

- Added `packages/config/src/templates.ts` with typed template track metadata and `getTemplateTrack`.
- Added config package tests for slug uniqueness, path alignment, and lookup.
- Updated docs app to render template tracks from `@repo/config/templates`.
- Added `scripts/template-catalog.ts` with `list`, `json`, and `validate` modes.
- Added root `templates:list`, `templates:json`, and `templates:validate` commands.
- Updated README and product docs with template catalog commands and ownership.
