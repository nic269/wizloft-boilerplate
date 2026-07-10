# Exec Plan

## Goal

Close the database, authorization, feature, and runtime contract gaps from the
third discussion audit without weakening the boilerplate's generic boundary.

## Scope

In scope:

- All numbered points and polish items in `plans/discussion-summary-3.md`.
- Forward migrations, focused tests, generated-project retention, and docs.

Out of scope:

- Production data cleanup without environment-specific evidence.
- New mail providers or organization ownership-transfer UX.

## Risk Classification

Risk flags:

- Data migration, authorization, concurrency, API contract, generated project,
  and runtime environment.

Hard gates:

- User-confirmed Owner policy.
- Forward-only migration.
- Focused tests before broad validation.
- Independent review before completion.

## Work Phases

1. Establish migration baseline and data constraints.
2. Make ownership and feature behavior atomic and explicit.
3. Strengthen API/runtime/UI contracts.
4. Run focused and broad validation.
5. Record decisions, evidence, and Harness trace.

## Stop Conditions

Pause for human confirmation if implementation requires deleting persistent
data, changing the confirmed Owner policy, weakening proof, or adopting a new
architecture direction.

