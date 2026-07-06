# US-011 Add One-Command E2E Database Bootstrap

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate must provide a single local command that can prepare a PostgreSQL database for Playwright auth E2E
tests, even when localhost port `5432` is already occupied.

## Relevant Product Docs

- `README.md`
- `package.json`
- `playwright.config.ts`
- `docker-compose.yml`

## Acceptance Criteria

- Root package exposes a one-command E2E bootstrap script.
- The bootstrap chooses an available PostgreSQL host port starting from configured `POSTGRES_PORT` or `5432`.
- The bootstrap starts the Docker Compose PostgreSQL service, waits for TCP readiness, generates Prisma client, pushes
  schema, and runs Playwright.
- Existing `pnpm test:e2e` behavior remains available for already-prepared databases.
- Harness backlog item #1 is closed with outcome evidence.

## Design Notes

- Commands: add `pnpm test:e2e:db`.
- Queries: no data queries added.
- API: no API contract changes.
- Tables: no schema changes.
- Domain rules: no product behavior changes.
- UI surfaces: no UI changes.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-011 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | Script syntax/import smoke. |
| Integration | Root package scripts and docs stay valid. |
| E2E | Optional local `pnpm test:e2e:db`; may be skipped when Docker/browser runtime is unavailable. |
| Platform | `pnpm check:ci`, `pnpm check-types`, and `pnpm test` remain green. |
| Release | README documents the new command. |

## Harness Delta

- Closes backlog item #1 after validation.

## Evidence

- `node --check scripts/e2e-with-db.mjs` passed.
- `pnpm check:ci` passed: 192 files.
- `pnpm check-types` passed: 24/24 packages.
- `pnpm test` passed: 24/24 package tasks.
- First `pnpm test:e2e:db` failed because port probing used local bind attempts, which are blocked in this sandbox.
- Changed port probing to connect-only detection: successful connect means occupied, connection failure means available.
- Final `pnpm test:e2e:db` passed with Docker access: selected localhost `5435`, started Docker Compose PostgreSQL,
  ran `db:generate`, ran `db:push`, and passed Playwright auth/invitation E2E 4/4.
- Backlog item #1 closed as implemented.
