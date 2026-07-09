# US-026 Compile API Production Runtime

## Status

implemented

## Lane

normal

## Product Contract

The API production container starts from a compiled JavaScript artifact instead
of executing TypeScript source through `tsx`. Local development can still use
`tsx watch`, but production runtime images must run with `node` and only
production dependencies.

## Relevant Product Docs

- `docs/deployment.md`
- `docs/stories/epics/E21-deployment-validation/US-025-production-container-runtime-validation.md`

## Acceptance Criteria

- `@repo/api-app` produces a `dist` runtime artifact during `pnpm build`.
- `@repo/api-app` starts production with `node dist/index.cjs`.
- `tsx` is dev-only for the API app and remains available for local watch mode.
- The Docker `api-runner` copies the compiled artifact from the installer stage.
- The Docker `api-runner` no longer invokes `tsx` or `pnpm` as the production
  process manager.
- Prisma Client generation still works inside the pruned production image.
- `pnpm docker:validate` proves API `/health`, app `/sign-in`, and web `/`.

## Design Notes

- Commands: US-026 originally added an esbuild script; US-027 later replaced it
  with `tsup` so the API artifact can compile workspace source while leaving
  npm dependencies in the production dependency graph.
- Runtime format: CommonJS `.cjs`, because the API dependency graph includes
  CommonJS packages that use dynamic `require`.
- API: `/openapi.json` now resolves its generated document through a lazy async
  cache instead of a module-level top-level await so the server can be bundled
  into CommonJS.
- Tables: no database schema changes.
- UI surfaces: no user-visible UI changes.
- Docker: the runner keeps the generated Prisma Client payload available under
  the app runtime path and continues to copy the database package Prisma client
  for compatibility with the pruned workspace graph.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-026 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | API OpenAPI/app tests pass after removing top-level await. |
| Integration | API app build emits `dist/index.cjs`; repo build accepts the new `dist/**` output. |
| E2E | Not required; no browser journey changes. |
| Platform | `pnpm docker:validate` starts compiled API/app/web production containers. |
| Release | `pnpm release:check` passes. |

## Harness Delta

- Intake `#33` records this maintenance request.
- Story `US-026` records the follow-up from US-025's production runtime proof.
- No Harness policy change is required.

## Evidence

- Added a compiled API artifact and changed `@repo/api-app` production start to
  `node dist/index.cjs`. US-027 later moved the implementation from
  `apps/api/build.mjs` to `apps/api/tsup.config.ts`.
- Moved `tsx` to `@repo/api-app` devDependencies and kept watch mode for local
  development.
- Updated the Docker API runner to copy `apps/api/dist` from the installer
  stage and run `node /app/apps/api/dist/index.cjs`.
- Replaced OpenAPI module top-level await with lazy `getOpenApiDocument()`.
- `pnpm --filter @repo/api test` passed 3 files and 22 tests.
- `pnpm --filter @repo/api-app check-types` passed.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm --filter @repo/api-app build` emitted `dist/index.cjs`.
- `pnpm check:ci` passed.
- `pnpm docker:validate` built and started API/app/web production containers,
  then received successful readiness responses from API `/health`, app
  `/sign-in`, and web `/`.
