# Overview

## Current Behavior

Fresh setup and E2E can bypass raw SQL migrations, Owner protection has a
concurrent write-skew window, Admin can cross the Owner boundary, feature flags
do not consistently disable behavior, and several database/API/runtime
contracts are weaker than the product semantics.

## Target Behavior

The boilerplate uses migrations as its baseline, preserves at least one Owner
under concurrency, restricts Owner-boundary changes to trusted actors, makes
feature switches truthful, and enforces the remaining integrity and runtime
contracts described in `plans/discussion-summary-3.md`.

## Affected Users

- Developers generating and operating new projects.
- Organization Owners, Admins, members, and invitees.
- API and deployment operators.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/release-readiness.md`

## Non-Goals

- A general ownership-transfer workflow.
- A scheduled invitation cleanup worker.
- Automatic repair of unknown persistent databases created with `db:push`.
- Conditional removal of disabled routes from generated OpenAPI.

