# Validation

## Proof Strategy

Use mocked/focused tests for branching and error mapping, PostgreSQL for
transaction/integrity behavior, generated-project proof for template retention,
and the release ladder for shared contracts.

## Test Plan

| Layer | Cases |
| --- | --- |
| Unit | Retry bounds, feature switches, exact permission pairs, request IDs |
| Integration | Concurrent Owner demotion, invitation expiry, integration FK/indexes |
| E2E | Migrated database auth and invitation journeys |
| Platform | Generated project and Docker runtime |
| Performance | No dedicated benchmark; retries are bounded to three attempts |
| Logs/Audit | Exactly one request completion log; role audit only on success |

## Fixtures

- Organization with two active Owners and one Admin.
- Active super admin without an organization membership.
- Pending expired invitation.
- Tenant and global integration connections.

## Commands

```text
Focused package tests
pnpm test:e2e:db
pnpm release:check
Fresh generated-project release check
pnpm docker:validate
```

## Acceptance Evidence

- Source `pnpm release:check` passed: template validation, Ultracite over
  327 files, 25 typecheck tasks, 25 workspace test tasks, boundaries, and nine
  builds.
- Focused auth, API, mail, config, generator, and environment-contract suites
  passed. Final API proof is 56/56 tests after adding the dynamic Better Auth
  reset-callback guard.
- A fresh PostgreSQL migration apply ran all three migrations; the auth
  integration suite passed 3/3 for concurrent Owner demotion, persisted
  invitation expiry, and integration ownership FK/cascade.
- One Playwright run overlapped active source edits and finished 3/6. The API
  dev process restarted during the run, producing connection refusals; the run
  is invalid as final browser proof and was not used as acceptance evidence.
- A clean generated project was produced, but its dependency install could not
  reach the npm registry inside the sandbox. The approved network retry was
  rejected by the execution environment's usage limit, so generated install and
  release proof remain an explicit evidence gap. Generator behavior is covered
  by the fresh 4/4 generator suite.
- Harness reported no present browser, container-runtime, Docker, or PostgreSQL
  capability rows. No final browser or Docker rerun is claimed.
