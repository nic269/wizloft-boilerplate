# US-025 Validate Production Container Runtimes

## Status

implemented

## Lane

normal

## Product Contract

Maintainers can build and run production containers for the product app,
marketing web app, and API from the shared \`APP_SCOPE\` Dockerfile. Each image
starts with only its runtime dependencies and exposes a deterministic health or
readiness signal before it is promoted.

## Relevant Product Docs

- \`docs/product/boilerplate-platform.md\`
- \`docs/deployment.md\`
- \`docs/release-readiness.md\`
- \`docs/stories/epics/E07-deployment/US-010-production-deployment-ci.md\`

## Acceptance Criteria

- The existing \`APP_SCOPE\` Docker design is retained unless a real image build
  or runtime check proves that separate targets are necessary.
- Production images build successfully for \`@repo/app\`, \`@repo/web\`, and
  \`@repo/api-app\` from a clean Docker context.
- Each container starts with platform-injected environment variables and
  without copying a local \`.env\` file into the image.
- The API exposes a successful \`/health\` response from inside the running
  container stack.
- The app and web surfaces expose successful HTTP readiness responses while
  using their production \`start\` commands.
- Database migration ordering is documented and is not hidden inside every
  application container startup.
- Image validation is repeatable through one documented command or a small
  repository script rather than an unrecorded sequence of shell commands.
- Deployment docs distinguish locally proven container behavior from checks
  that require a selected hosting provider.

## Design Notes

- Commands: add the smallest repeatable image build/run/health-check command if
  the existing commands are insufficient.
- Queries: use the API \`/health\` route and HTTP readiness checks; do not add a
  new product query solely for deployment validation.
- API: preserve current routes and public contracts.
- Tables: no schema changes expected.
- Domain rules: migrations remain an explicit release step before traffic is
  promoted.
- UI surfaces: no user-visible UI changes.
- Container structure: prefer one parameterized Dockerfile over duplicated
  per-app Dockerfiles while all three surfaces share the same build pattern.

## Validation

When updating durable proof status, use numeric booleans:
\`scripts/bin/harness-cli story update --id US-025 --unit 1 --integration 1 --e2e 0 --platform 1\`.

| Layer | Expected proof |
| --- | --- |
| Unit | Syntax or focused tests for any validation script added by the story. |
| Integration | Build the \`@repo/app\`, \`@repo/web\`, and \`@repo/api-app\` images from the shared Dockerfile. |
| E2E | Not required; US-024 owns browser product journeys. |
| Platform | Start the three production containers and receive successful HTTP readiness responses, including API \`/health\`. |
| Release | \`pnpm release:check\` passes and deployment/readiness docs match the empirical result. |

## Execution Pause Points

- If Docker is unavailable, record the missing runtime as weak platform proof;
  do not claim the story implemented.
- If image validation requires a hosting-provider choice, stop at the portable
  local contract and record the provider-specific work as a follow-up.
- If the API and Next.js images require materially different runner layouts,
  capture the failing command and evidence before splitting the Dockerfile.

## Harness Delta

- Intake \`#32\` records this maintenance request.
- \`deploy-verification\` has no present provider in the Harness tool registry;
  local Docker availability must therefore be checked during execution.
- No Harness policy change is required.

## Evidence

- Added `pnpm docker:validate` backed by
  `scripts/docker/validate-production-runtimes.mjs`.
- Root `Dockerfile` now keeps one prune/build flow and exposes separate
  `app-runner`, `api-runner`, and `web-runner` targets.
- The API runtime now prefers `PORT` and binds `0.0.0.0` in
  `apps/api/src/index.ts`, which is the required container-safe behavior.
- Fixed a production-only ESM crash in `packages/database/src/client.ts` by
  making `Prisma` a type-only export.
- The API runner executes its production `tsx` binary directly instead of
  invoking pnpm as a runtime process manager. The generated Prisma Client and
  its `.prisma/client` payload are copied from the installer stage into the
  pruned production dependency graph.
- Runtime validation preserves failed containers long enough to include
  startup stderr in the error and removes its temporary containers, images,
  and network during cleanup.
- `pnpm check-types` passed after the runtime fixes.
- `pnpm build` passed after the runtime fixes.
- `pnpm docker:validate` built and started `api-runner`, `app-runner`, and
  `web-runner`, then received successful readiness responses from API
  `/health`, app `/sign-in`, and web `/`.
- `pnpm release:check` passed the template, Ultracite, TypeScript, test,
  boundary, and nine-task production build ladder.
