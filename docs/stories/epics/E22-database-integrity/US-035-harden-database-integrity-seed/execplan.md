# Exec Plan

## Goal

Make generic persisted invariants deployable and repeatable.

## Scope

In scope: Prisma schema/migration, built-in role creation, seed reconciliation,
unit and PostgreSQL proof.

Out of scope: automatic migration of pre-existing unmanaged databases.

## Risk Classification

High-risk: schema constraints and seed mutation. Hard gates are Prisma
format/generate, focused tests, clean migration apply, two seed runs, E2E, and
release check.

## Work Phases

1. Add accepted constraints and role relation.
2. Reconcile system role seed data.
3. Generate/apply initial migration on clean PostgreSQL.
4. Run seed twice and verify counts.
5. Run browser/release validation and update evidence.

## Stop Conditions

Pause if applying to an existing database would require destructive automated
data conversion.
