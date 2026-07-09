# US-027 Optimize API Production Artifact

## Status

implemented

## Lane

normal

## Product Contract

The API production container should keep the compiled JavaScript runtime from
US-026, but the artifact should stay lean enough for a boilerplate with a small
example API surface. Runtime npm dependencies should remain in the pruned
production dependency graph instead of being bundled into one large generated
file.

## Relevant Product Docs

- `docs/deployment.md`
- `docs/stories/epics/E21-deployment-validation/US-026-compile-api-production-runtime.md`

## Acceptance Criteria

- `@repo/api-app` builds with the proven tsup CJS service pattern used by the
  reference Ops Hub API.
- The API entry imports the runtime app subpath instead of the root package
  barrel so browser/client exports are not pulled into the server entrypoint.
- Workspace source packages used by the API are compiled into the artifact.
- Npm dependencies remain external and are supplied by `pnpm install --prod` in
  the pruned Docker runtime.
- The emitted API artifact is materially smaller than the previous bundled
  esbuild output.
- `pnpm docker:validate` still proves the API, app, and web production
  containers boot.

## Design Notes

- Commands: `apps/api/tsup.config.ts` owns the production API build.
- Runtime format: CommonJS `.cjs`, matching the Node process command and the
  CJS dependency constraints discovered in US-026.
- API: `apps/api/src/index.ts` imports `@repo/api/app` directly to avoid
  bundling browser/server client exports from the root `@repo/api` barrel.
- Tables: no database schema changes.
- UI surfaces: no browser UI changes.
- Docker: keep the pruned production dependency install and Prisma generated
  client copy behavior from US-026.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-027 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | API package tests continue to pass. |
| Integration | API app build emits `dist/index.cjs` with a smaller artifact. |
| E2E | Not required; no browser journey changes. |
| Platform | `pnpm docker:validate` starts API/app/web production containers. |
| Release | `pnpm release:check` passes or a narrower release-equivalent ladder is documented. |

## Harness Delta

- Intake `#34` records this maintenance request.
- Story `US-027` records the optimization follow-up from US-026.
- No Harness policy change is required.

## Evidence

- Replaced `apps/api/build.mjs` esbuild bundling with `apps/api/tsup.config.ts`.
- Changed `apps/api/src/index.ts` to import `createApiApp` from
  `@repo/api/app` instead of the root `@repo/api` barrel.
- API production build now emits `dist/index.cjs` at `3.68 MB`; the previous
  US-026 esbuild bundle emitted `9.6 MB` plus a `14 MB` source map.
- Docker API runner now uses a filtered production install for the API runtime
  workspace graph instead of installing every pruned workspace package.
- Docker API runner copies the generated Prisma payload into the package-local
  pnpm `.prisma/client` directory resolved from `@prisma/client/default.js`.
- `pnpm --filter @repo/api test` passed 3 files and 22 tests.
- `pnpm --filter @repo/api check-types` passed.
- `pnpm --filter @repo/api-app check-types` passed.
- `pnpm --filter @repo/api-app build` passed and emitted
  `dist/index.cjs 3.68 MB`.
- `pnpm check:ci` passed.
- `pnpm docker:validate` built and started API/app/web production containers,
  then received successful readiness responses from API `/health`, app
  `/sign-in`, and web `/`.
- `pnpm release:check` passed templates, Ultracite, 25 workspace typechecks,
  tests, boundaries, and 9 builds.
