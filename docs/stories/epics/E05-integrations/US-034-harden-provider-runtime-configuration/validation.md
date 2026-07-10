# Validation

## Proof Strategy

Unit tests cover disabled/configured/misconfigured states. The API contract
accepts safe diagnostics. Docker uses the production API image and verifies
partial Resend and S3 containers exit before readiness.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Mail/storage state resolution and production configuration errors. |
| Integration | API readiness payload includes state diagnostics. |
| E2E | Not required for provider configuration. |
| Platform | Production API image rejects incomplete Resend and S3. |
| Performance | Not applicable. |
| Logs/Audit | Error text names missing variables only. |

## Commands

```text
pnpm --filter @repo/mail test
pnpm --filter @repo/storage test
pnpm --filter @repo/api test
pnpm docker:validate
pnpm release:check
```

## Acceptance Evidence

All focused tests passed. Docker production startup rejected both partial
provider configurations and the full app/API/web smoke passed.
