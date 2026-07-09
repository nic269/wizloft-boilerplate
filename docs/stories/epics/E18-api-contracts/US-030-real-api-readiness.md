# US-030 Real API Readiness

## Status

implemented

## Lane

normal

## Product Contract

`GET /health` remains a cheap liveness check. `GET /ready` reports whether the
API can accept traffic by checking database connectivity and returning a
machine-readable readiness payload. When the database check fails, `/ready`
returns `503 Service Unavailable` through the standard API error envelope.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`

## Acceptance Criteria

- `/ready` performs a small database connectivity check.
- `/ready` returns `200` with `ok: true` when required checks pass.
- `/ready` returns `503` with a standard `{ error }` envelope when the database
  is unavailable.
- Optional provider statuses are included as diagnostics but absent optional
  credentials do not make readiness fail.
- Legacy `/rpc/ready.get` preserves the `{ data }` envelope and returns the same
  readiness payload while the deprecated RPC surface remains supported.

## Design Notes

- Commands: `pnpm --filter @repo/api test`, `pnpm check:ci`, `pnpm check-types`,
  `pnpm boundaries`.
- Queries: use Prisma `$queryRaw` with a tiny `SELECT 1` probe.
- API: `/ready`, `/rpc/ready.get`.
- Tables: none.
- Domain rules: liveness and readiness are separate operational signals.
- UI surfaces: none.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-030 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | API health tests cover ready success and database failure. |
| Integration | API contract/OpenAPI tests still pass. |
| E2E | Not required. |
| Platform | Typecheck, lint, and boundaries pass. |
| Release | Release ladder passes or focused equivalent is documented. |

## Harness Delta

None expected.

## Evidence

- `pnpm --filter @repo/api test` passed 3 files / 24 tests, including `/ready`
  success and database-failure cases.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm check:ci` passed across 300 files.
- `pnpm check-types` passed 25 workspace typecheck tasks.
- `pnpm boundaries` passed.
- `pnpm release:check` passed template validation, Ultracite, typechecks,
  tests, boundaries, and 9 build tasks.
