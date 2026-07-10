# Validation

## Proof Strategy

Use focused unit tests for each changed boundary, generated-project tests for source-tree safety, API tests for disclosure and intentional errors, and the full release ladder for shared contracts.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Nested/sibling/symlinked targets, job status/config, organization flag removal, mail CR/LF rejection through shared and raw provider paths |
| Integration | Hono and oRPC unknown-error envelopes, diagnostic logging, and retained request IDs |
| E2E | No new browser behavior; existing suite remains covered by release tests |
| Platform | Generator suite and production builds |
| Performance | No dedicated benchmark; checks are constant-time string/header validation |
| Logs/Audit | Unknown exception diagnostics remain server-side with a stable event |

## Fixtures

- Temporary generator source/target directories.
- Secret-looking exception message.
- Mail header values containing carriage return or line feed.

## Commands

```text
pnpm --filter @repo/config --filter @repo/jobs --filter @repo/mail --filter @repo/api test
pnpm exec vitest run scripts/boilerplate-init/generator.test.ts
pnpm release:check
```

## Acceptance Evidence

- Generator regressions passed 7/7, covering direct descendants, symlinked
  ancestors, sibling prefixes, and target non-creation on rejection.
- Focused package proof passed: config 6/6, jobs 7/7, mail 12/12, and API
  58/58. API cases cover both Hono and real oRPC procedure failures; mail cases
  cover shared and raw provider entrypoints.
- Focused config/jobs/mail/API/web/docs typechecks and targeted Ultracite checks
  passed.
- A final generated scaffold at
  `/private/tmp/wizloft-us039-final-20260710-1800` retained `jobs: false`, no
  organization feature flag, and `workspace surface` marketing wording. Install
  was intentionally skipped because no dependency or lockfile change was made.
- The source `pnpm release:check` passed after review fixes: template catalog,
  Ultracite over 327 files, 25/25 typechecks, 25/25 workspace tests,
  boundaries, and 9/9 builds.
- Decision `0021-generator-runtime-safety-boundaries` verification passed the
  same release ladder.
- Independent two-stage review passed spec compliance and code quality/security
  with no P0-P3 findings. An earlier edge-case scout found four bypass/stale-copy
  gaps; all were fixed and re-verified before the final review.
- Browser automation and container-runtime capabilities were absent from the
  Harness registry. No browser or Docker claim is made because this change has
  no new browser journey or container-only behavior.
