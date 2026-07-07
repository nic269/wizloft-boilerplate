# Exec Plan

## Goal

Remove permission policy duplication without changing accepted authorization
behavior.

## Scope

In scope:

- Browser-safe policy package and tests.
- Auth, API, app, provisioning, and seed migration.
- Dependency and boundary updates.
- Compatibility exports and architecture documentation.

Out of scope:

- New permissions, role editing, ownership rules, or database migration.

## Risk Classification

Risk flags:

- Authorization source-of-truth and cross-module dependency change.
- Seed behavior for future databases.

Hard gates:

- Preserve all accepted catalog pairs and runtime permission checks.
- Keep the policy package dependency-free and browser-safe.
- Prove every preset/default is inside the catalog.
- Pass auth/API tests, boundaries, and production builds.

## Work Phases

1. Inventory catalog and duplicates.
2. Extract static policy with derived types and guards.
3. Migrate auth, API, UI, and seed consumers.
4. Add policy drift tests and dependency rules.
5. Run focused and release validation.
6. Update decisions, story, and Harness evidence.

## Stop Conditions

Pause if accepted permission keys, persisted authorization semantics, or tenant
boundaries need to change.
