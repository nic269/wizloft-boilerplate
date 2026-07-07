# US-024 Exec Plan

## Goal

Provide explicit, repeatable browser proof for the boilerplate's three critical
product journeys.

## Scope

In scope:

- Shared deterministic E2E user helpers.
- Auth, organization isolation, and invitation acceptance smoke tests.
- Real PostgreSQL bootstrap validation through `pnpm test:e2e:db`.
- Documentation and Harness proof updates.

Out of scope:

- Product behavior or database schema changes.
- Exhaustive RBAC and audit UI browser coverage.
- CI workflow changes.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Audit/security.
- Existing behavior.
- Weak proof.
- Multi-domain.

Hard gates:

- Auth and authorization validation must not be weakened.

## Work Phases

1. Inspect existing browser journeys and selectors.
2. Define isolated fixtures and tenant-scope assertions.
3. Implement the dedicated organization smoke and shared helpers.
4. Run the real-database E2E suite.
5. Run repository quality gates and review the diff.
6. Record Harness evidence.

## Stop Conditions

Pause if tests reveal a product defect requiring an auth, authorization, data,
or public-contract change.

