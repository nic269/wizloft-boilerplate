---
status: completed
---

# Phase 05: Integrated Verification

## Completion

- [x] Focused affected-package tests and typechecks.
- [x] Full lint, type, test, boundary, build, and release ladder.
- [x] Fresh generated-project install and release ladder.
- [x] Independent tester, debugger, and mandatory code review.
- [x] Browser/Docker capability lookup; unavailable capabilities recorded as clean skips.

## Proof Ladder

1. Focused package tests and typechecks.
2. Prisma generate, validate, and clean migration apply.
3. `pnpm check:ci`, `pnpm check-types`, `pnpm test`, and `pnpm boundaries`.
4. `pnpm test:e2e:db`.
5. `pnpm docker:validate`.
6. Generate a clean project and run its release validation.
7. `pnpm release:check` and Harness story verification.

## Review

- Review auth bypasses, secret-bearing outbox exposure, migration safety,
  deterministic pagination, public contract updates, and generated-project
  drift before completion.
