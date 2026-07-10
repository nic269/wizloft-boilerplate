---
status: completed
---

# Phase 03: Provider and Jobs Contracts

## Completion

- [x] Share provider requirement evaluation across startup and readiness.
- [x] Report local storage truthfully.
- [x] Make job run reads asynchronous.
- [x] Remove unsupported timeout contract.
- [x] Scope local job idempotency consistently with the database model.

## Requirements

- Use one provider requirement evaluator for startup and `/ready`.
- Report local filesystem storage as `local`, not `durable`.
- Make job query methods asynchronous.
- Remove unsupported `timeoutMs` until cooperative cancellation exists.
- Use the job scope key in local idempotency behavior.

## Files

- `packages/api/src/health.ts`
- `packages/api/src/contracts/health.ts`
- `packages/mail/src/send.ts`
- `packages/storage/src/index.ts`
- `packages/jobs/src/index.ts`
- Related tests and docs.

## Validation

- Provider package and API readiness tests.
- Docker production startup rejection and success cases.

## Risks

- Positive production Docker fixtures need a syntactically configured real mail
  provider even when no message is sent.
