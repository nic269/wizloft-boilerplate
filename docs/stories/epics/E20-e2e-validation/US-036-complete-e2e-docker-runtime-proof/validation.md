# Validation

## Proof Strategy

Run the public commands exactly as a fork maintainer would and retain command
results in Harness evidence.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Syntax/lint/type validation for scripts and Next config. |
| Integration | PostgreSQL reset/migration and all image builds. |
| E2E | Auth, organization isolation, and invitation on desktop/mobile. |
| Platform | API/app/web readiness and app/web public asset probes. |
| Performance | CI browser budget deliberately not accepted. |
| Logs/Audit | Failed containers expose status/logs; temporary resources are removed. |

## Commands

```text
pnpm test:e2e:db
pnpm docker:validate
pnpm release:check
```

## Acceptance Evidence

Playwright passed 6 tests and removed its Compose project/volume. Docker built
and started all three targets, verified two provider startup failures, served
both public assets, and passed API/app/web readiness.
