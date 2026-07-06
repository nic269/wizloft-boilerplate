# US-010 Add Production Deployment And CI Discipline

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate must include a repeatable production deployment baseline: app surfaces have production start scripts,
Next.js surfaces emit standalone build output, Docker uses a Turbo prune path, CI runs the core validation ladder, and
deployment docs explain env, database migration, and provider boundaries.

## Relevant Product Docs

- `README.md`
- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/decisions/0008-personal-saas-boilerplate-architecture.md`

## Acceptance Criteria

- Dockerfile uses `turbo prune` for a selected `APP_SCOPE`.
- `.dockerignore` excludes local secrets and generated outputs.
- `apps/app`, `apps/web`, `apps/docs`, and `apps/api` expose production `start` scripts.
- Next.js app surfaces use standalone output.
- CI workflow runs install, Prisma client generation/schema push, check, typecheck, tests, boundaries, and build.
- Deployment docs explain production env injection and database migration order.
- Harness matrix records proof for the story.

## Design Notes

- Commands: add package `start` scripts and GitHub Actions validation commands.
- Queries: no data queries added.
- API: no API route contract changes.
- Tables: no schema changes.
- Domain rules: no product-domain deployment behavior added.
- UI surfaces: no user-facing UI change.

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-010 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm test` remains green. |
| Integration | `pnpm check-types` proves package scripts/config imports. |
| E2E | Not required for this deployment scaffold. |
| Platform | `pnpm check:ci`, `pnpm boundaries`, and `pnpm build`; Docker syntax is reviewed by build command if available. |
| Release | Deployment docs and CI workflow present. |

## Harness Delta

- `deploy-verification` capability is currently inactive, so Docker image execution is documented but not required as a local gate.

## Evidence

- `pnpm check:ci` passed.
- `pnpm check-types` passed: 24/24 packages.
- `pnpm test` passed: 24/24 package tasks.
- `pnpm boundaries` passed.
- First `pnpm build` passed but emitted a Turbo no-output warning for `@repo/api-app#build`.
- Added a package-specific Turbo task override for `@repo/api-app#build` with empty outputs.
- Final `pnpm check:ci` passed.
- Final `pnpm build` passed: 8/8 build tasks. Storybook emitted default asset-size warnings.
- Docker image execution was not run because no `deploy-verification` tool is registered and this story only establishes the baseline deployment contract.
- CI screenshot regression found missing `NEXT_PUBLIC_WEB_URL` during `@repo/web#build`; added `NEXT_PUBLIC_WEB_URL`
  and `BETTER_AUTH_URL` to workflow env.
- CI-like direct `next build` for `@repo/web` and `@repo/docs` passed with workflow env values and no root `.env`
  loader.
