# Exec Plan

## Goal

Remove silent production fallback while preserving optional local providers.

## Scope

In scope: mail/storage status, SMTP delivery, API startup assertion, readiness
contract, tests, env docs, Docker fail-fast smoke.

Out of scope: real credential smoke and hosting-platform checks.

## Risk Classification

High-risk: startup and external-provider behavior. Hard gates are focused
provider/API tests, typecheck, release check, and Docker runtime proof.

## Work Phases

1. Define safe provider states and errors.
2. Implement production assertions and SMTP.
3. Wire API startup and readiness diagnostics.
4. Add unit and Docker startup proof.
5. Update docs and Harness evidence.

## Stop Conditions

Pause if optional providers become required or diagnostics would expose secret
values.
