# Phase 03: Provider Runtime Fail-Fast And Diagnostics

## Status

Implemented as `US-034`.

## Goal

Make optional providers safe in production by distinguishing disabled,
configured, partially configured, and broken states without making local
development harder.

## Candidate Stories

- Production fail-fast for partially configured S3/R2 storage.
- Production fail-fast for partially configured Resend or SMTP mail.
- Provider status diagnostics that expose enough detail for deployment checks
  without leaking secrets.

## Risk

High-risk. This phase changes external provider behavior, runtime startup
semantics, and production readiness signals.

## Files To Inspect First

- `packages/storage/src/**`
- `packages/mail/src/**`
- `packages/jobs/src/**`
- `packages/api/src/health.ts`
- `packages/api/src/contracts/health.ts`
- Provider env `keys.ts` files.
- Provider tests.

## Validation

- Provider env contract tests.
- Provider status tests.
- Production-like partial-env smoke tests.
- `pnpm release:check`
- `pnpm docker:validate` if startup/runtime behavior changes.

## Pause Points

- Confirm whether fail-fast triggers only when a provider is explicitly selected
  or whenever partial credentials are present.
- Confirm if local development should always degrade gracefully, even with
  partial credentials.

## Outcome

- Absent providers remain optional.
- Explicit or inferred partial mail/S3-compatible configuration is reported as
  `misconfigured` and fails production API startup.
- Resend and SMTP are both implemented mail providers.
- `pnpm docker:validate` proves S3 and Resend startup rejection.
