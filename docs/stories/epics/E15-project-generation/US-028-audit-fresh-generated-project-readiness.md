# US-028 Audit Fresh Generated Project Readiness

## Status

implemented

## Lane

normal

## Product Contract

A freshly generated project must be independently usable after the recent API
runtime, Docker, and release-readiness changes. The generated repo should behave
like a real project fork, not like a partial copy of the source boilerplate.

## Relevant Product Docs

- `README.md`
- `docs/release-readiness.md`
- `docs/deployment.md`
- `boilerplate.init.json`

## Acceptance Criteria

- `pnpm boilerplate:init <target> --name <name> --validate` creates a fresh
  project outside the source repo.
- Generated output excludes Harness, agent, planning, template, local cache, and
  source-only release artifacts.
- Generated `pnpm install` succeeds and runs Prisma generation through the
  generated `postinstall` contract.
- Generated `pnpm release:check` passes without source-only template commands.
- Generated app, API, and web production Docker runtimes validate when the
  generated project includes those surfaces.
- Any generated onboarding or deployment gap found by the audit is fixed in the
  boilerplate source.

## Design Notes

- Commands: exercise `pnpm boilerplate:init` and generated project scripts.
- Queries: none.
- API: preserve the generated Hono API runtime contract from US-027.
- Tables: no schema changes.
- Domain rules: no product-domain scaffolds are introduced.
- UI surfaces: generated app, web, email, and Storybook surfaces remain
  selected by default.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-028 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | Generator tests still pass |
| Integration | Fresh generated repo passes install and release ladder |
| E2E | Not required unless a generated browser flow fails |
| Platform | Generated Docker production runtime validation passes |
| Release | Source `pnpm release:check` passes after any fixes |

## Harness Delta

This story turns generated-project readiness into a repeatable release proof.
If the manual audit finds repeated steps, promote them into a generator
validation helper or release checklist.

## Evidence

- Source focused generator test passed:
  `pnpm exec vitest run scripts/boilerplate-init/generator.test.ts`.
- Source release gate passed:
  `pnpm release:check`.
- Source production containers passed:
  `pnpm docker:validate`, validating API `/health`, app `/sign-in`, and web `/`.
- Fresh generated project passed:
  `pnpm boilerplate:init /private/tmp/wizloft-us028-generated-20260709e --name "US 028 Generated App" --validate`.
- Fresh generated project production containers passed from
  `/private/tmp/wizloft-us028-generated-20260709e` with `pnpm docker:validate`,
  validating API `/health`, app `/sign-in`, and web `/`.
- Generated output artifact check returned no source-only Harness, agent,
  docs, template, local cache, or boilerplate-init paths at the audited depth.

Notes:

- Docker prune install stages do not include the Prisma schema. The generated
  root `postinstall` now delegates to `scripts/postinstall.mjs`, which runs
  Prisma generation only when the schema is present.
- Docker installer stages copy `scripts/postinstall.mjs` from the build context
  before `pnpm install`, so root lifecycle scripts remain available in pruned
  JSON-only installs.
- Next/Better Auth build logs warn when test/default secrets are used during
  generated fixture builds. Runtime container validation still passed, and
  production deployments remain expected to provide real `BETTER_AUTH_SECRET`
  and URL values.
