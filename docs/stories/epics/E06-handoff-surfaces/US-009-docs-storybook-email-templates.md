# US-009 Complete Docs Storybook Email And Template Surfaces

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate must include useful handoff surfaces so future products can understand the core contract, inspect
design-system patterns, preview transactional email templates, and choose add-on template tracks without importing
domain-specific code into core.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `README.md`
- `templates/*/README.md`

## Acceptance Criteria

- Docs app explains first-run, validation, env, auth, org/RBAC, API, provider, deployment, and template boundaries.
- Storybook contains examples beyond a single button, including the app shell, form controls, and empty/loading/error states.
- Email preview app exposes invite, password reset, and verification templates from the mail package.
- Template READMEs describe when to use each track, what belongs there, and what must stay out of core.
- Harness matrix records proof for the story.

## Design Notes

- Commands: no runtime commands added.
- Queries: no data queries added.
- API: no API contract changes.
- Tables: no schema changes.
- Domain rules: domain-specific workflows remain in templates or future add-on packages.
- UI surfaces: `apps/docs`, `apps/storybook`, `apps/email`, `templates/*`.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-009 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm test` covers package smoke tests. |
| Integration | `pnpm check-types` proves cross-package imports for docs, email, storybook, and mail templates. |
| E2E | Not required; no user workflow changed. |
| Platform | `pnpm check`, `pnpm boundaries`, and `pnpm build` prove monorepo surfaces. |
| Release | Confirm `.env.example` and README remain accurate. |

## Harness Delta

- `harness-intake-griller` is referenced by `AGENTS.md` but is not present in `.codex/skills`; record friction if not fixed in this story.

## Evidence

- `pnpm --filter @repo/mail test` passed: 1 file, 2 tests.
- First `pnpm check-types` caught a Storybook required-args inference issue; fixed by using render-only meta.
- `pnpm check-types` passed: 24/24 packages.
- `pnpm test` passed: 24/24 package tasks.
- `pnpm boundaries` passed.
- First `pnpm check` caught a Storybook label/input accessibility issue; fixed with `htmlFor` and `id`.
- `pnpm check` passed: 191 files.
- `pnpm build` passed: 8/8 build tasks. Storybook emitted default asset-size warnings; Turbo emitted existing no-output warnings for api-app/email-app.
