# US-019 Generate Clean Projects With Boilerplate Init

## Status

implemented

## Lane

normal

## Product Contract

The internal boilerplate source may retain Harness, agent, planning, and release
tooling. A generated project must contain only the reusable application
foundation and its engineering checks.

## Acceptance Criteria

- `pnpm boilerplate:init <target>` creates a project outside the source repo.
- Cleanup and app-selection rules live in `boilerplate.init.json`.
- `app` and `api` remain required; web, docs, email, and Storybook are selectable.
- Product name, package name, database name, app metadata, README, and CI are rewritten.
- A gitignored local `.env` is initialized from the rewritten example.
- Harness, agent, template, planning, and source release artifacts are absent.
- Generated release validation no longer calls removed template tooling.
- Fresh installs generate the Prisma client before type and build checks.
- The generator core can later be called by `wizloft boilerplate init`.

## Non-Goals

- Publishing the `wizloft` CLI.
- Removing individual feature packages.
- Building domain-specific template scaffolds.
- Initializing a new Git repository.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Generator creates clean output and rejects missing required apps |
| Integration | Generated project preserves boundary and release scripts |
| Platform | `pnpm check:ci`, `pnpm check-types`, `pnpm test`, `pnpm boundaries` |

## Evidence

- Generator unit tests cover cleanup, identity rewrite, selected app surfaces,
  local env initialization, CI cleanup, and required app enforcement.
- A generated `app/api/web` project installed 22 workspace packages, generated
  Prisma Client during postinstall, and passed its complete `release:check`.
- Source `pnpm release:check` passed template validation, lint, 24-package
  typecheck/test/boundary checks, and all eight production build tasks.
