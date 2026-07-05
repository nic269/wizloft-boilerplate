# US-007 API Contract RPC Foundation

## Status

implemented

## Lane

normal

## Product Contract

The API package exposes a small typed contract registry for stable public API procedures. Existing Hono REST health
routes keep their URLs, while matching `/rpc/:procedure` routes provide an RPC-style surface for typed clients.
`/openapi.json` is generated from the same registry for registered procedures.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`

## Acceptance Criteria

- Existing `/status`, `/health`, and `/ready` routes keep their response shape.
- `/rpc/status.get`, `/rpc/health.get`, and `/rpc/ready.get` return `{ data }` envelopes.
- Unknown RPC procedure IDs return the existing structured API error envelope.
- OpenAPI operation IDs and path entries are generated from the contract registry.
- API client can call typed RPC procedures by procedure ID.

## Design Notes

- Commands: none.
- Queries: status, health, ready.
- API: Hono REST routes plus `/rpc/:procedure`.
- Tables: none.
- Domain rules: procedure IDs are explicit and stable.
- UI surfaces: none.

The implementation avoids adding network-fetched `@orpc/*` packages in this slice. The registry keeps a narrow
replacement point for adding the official runtime later.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id <id> --unit 1 --integration 1 --e2e 0 --platform 0`.

| Layer | Expected proof |
| --- | --- |
| Unit | OpenAPI document is generated from registry paths and stable operation IDs. |
| Integration | Hono serves REST and RPC health procedures with structured errors. |
| E2E | Existing auth/invitation e2e remains the smoke layer; no browser-visible behavior changes. |
| Platform | `pnpm check`, `pnpm check-types`, `pnpm test`, `pnpm boundaries`, `pnpm build`. |
| Release | No migration or env change. |

## Harness Delta

Project-scoped `harness-intake-griller` remains missing; no new Harness policy changes.

## Evidence

- `pnpm --filter @repo/api test` passed 2 files, 17 tests.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm check` passed 183 files after formatting.
- `pnpm check-types` passed 24/24 tasks.
- `pnpm test` passed 24/24 tasks.
- `pnpm boundaries` passed.
- `pnpm build` passed 8/8 tasks; Storybook emitted existing asset-size warnings only.
- Dev smoke: existing listeners on ports 3000/3002 returned 200 for `/sign-in`, `/rpc/status.get`, and `/openapi.json`.
  Starting a second dev server failed with `EADDRINUSE`, as expected while those listeners were active.
