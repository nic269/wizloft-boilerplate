---
status: completed
---

# Phase 04: API and Generator Contracts

## Completion

- [x] Validate init manifests with tracked JSON Schema and Ajv 2020.
- [x] Remove legacy RPC health aliases.
- [x] Add deterministic cursor pagination and update app callers.
- [x] Remove source-only Ajv from generated project dependencies.
- [x] Exclude private outbox data from source and generated Docker contexts.

## Requirements

- Validate `boilerplate.init.json` with Ajv 2020 using the tracked JSON Schema.
- Remove deprecated `/rpc/health.get`, `/rpc/ready.get`, and `/rpc/status.get`.
- Add deterministic opaque cursor pagination to members, roles, invitations,
  and audit logs.
- Keep response `data` as an array and add `pageInfo.nextCursor`.
- Update product UI callers without silently truncating role/member choices.

## Files

- `scripts/boilerplate-init/*`
- `packages/api/src/contracts/*`
- `packages/api/src/routers/*`
- `packages/auth/src/access-control.ts`
- `packages/auth/src/invitations.ts`
- `apps/app/app/settings/*`
- Related tests and OpenAPI assertions.

## Validation

- Generator, auth, API, app type, OpenAPI, and generated-project checks.

## Risks

- Pagination is an intentional public contract change and all in-repo callers
  must move atomically.
