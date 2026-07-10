# Exec Plan

## Goal

Make browser and production-container proof deterministic for future forks.

## Scope

In scope: E2E DB lifecycle, Next tracing roots, public assets, Docker probes,
release docs.

Out of scope: platform deployment and CI browser promotion.

## Risk Classification

Normal: validation/runtime packaging. Hard gates are six browser journeys,
three image builds/starts, public asset probes, and release check.

## Work Phases

1. Isolate and reset E2E database lifecycle.
2. Configure monorepo tracing and runner assets.
3. Extend Docker runtime probes.
4. Run browser, Docker, and release validation.
5. Record Harness evidence.

## Stop Conditions

Pause if checks require a hosting platform or weakened cleanup guarantees.
