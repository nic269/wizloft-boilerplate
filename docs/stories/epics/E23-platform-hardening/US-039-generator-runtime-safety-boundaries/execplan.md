# Exec Plan

## Goal

Make generator and runtime boundaries fail closed without expanding the boilerplate into speculative provider or tenancy modes.

## Scope

In scope:

- Every point in `plans/discussion-summary-4.md`.
- Focused tests, product/decision docs, generated-project retention, and Harness evidence.

Out of scope:

- Durable job execution infrastructure.
- Single-tenant generation.
- New mail providers or stricter mailbox grammar validation.

## Risk Classification

Risk flags:

- Filesystem safety, audit/security, external providers, public API behavior, existing generated-project contracts, and multi-domain changes.

Hard gates:

- Preserve deliberate `ApiError` contracts.
- Validate before filesystem copy or provider delivery.
- Focused tests before broad validation.
- Independent review before completion.

## Work Phases

1. Harden generator topology checks.
2. Correct jobs/config and workspace wording.
3. Sanitize unexpected API failures and validate mail headers.
4. Align documentation and generated-project tests.
5. Run focused and broad proof, review, and record Harness evidence.

## Stop Conditions

Pause if the work requires a durable jobs architecture, changes intentional client error messages, weakens existing validation, or introduces a tenancy-mode decision.

