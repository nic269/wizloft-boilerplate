# US-017 Fix Upgraded Dependency Build

## Status

implemented

## Lane

normal

## Product Contract

Running `pnpm upgrade:deps` should leave the boilerplate on current dependency
contracts without breaking the local release ladder.

## Relevant Product Docs

- `README.md`
- `docs/release-readiness.md`

## Acceptance Criteria

- Prisma 7 generates a client without schema validation errors.
- Runtime Prisma clients use a PostgreSQL driver adapter while preserving the
  singleton pattern.
- Ultracite 7 checks resolve the configured presets and keep practical
  boilerplate overrides explicit.
- `pnpm build` passes after the dependency upgrade.

## Design Notes

- Prisma 7 moved CLI datasource URLs from `schema.prisma` into
  `prisma.config.ts`.
- Runtime database access now uses `@prisma/adapter-pg` with the existing
  `DATABASE_URL` env contract.
- Ultracite 7.9 exposes Biome presets through `ultracite/biome/*`.
- The root Biome config keeps Ultracite presets but disables noisy or
  false-positive rules for this codebase: JSX handler binding, intentional
  await-in-loop polling/retry flows, custom error-cause false positives,
  method-signature style, and dependency-upgrade type inference false positives.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm test` |
| Integration | `pnpm --filter @repo/database exec prisma validate` |
| E2E | Not required for build regression |
| Platform | `pnpm check:ci`, `pnpm check-types`, `pnpm boundaries`, `pnpm build` |
| Release | `pnpm release:check` when sandbox permits full ladder |

## Harness Delta

- Intake #20 records the maintenance request.
- This story documents the Prisma 7 and Ultracite 7 upgrade compatibility
  fixes so future dependency upgrades have a reference point.

## Evidence

- Initial failure: `pnpm build` failed in `@repo/database` with Prisma `P1012`
  because `datasource.url` is no longer supported in Prisma 7 schema files.
- `pnpm --filter @repo/database generate` passed after adding
  `packages/database/prisma.config.ts`.
- `pnpm --filter @repo/database exec prisma validate` passed.
- `pnpm check` passed.
- `pnpm check:ci` passed.
- `pnpm check-types` passed.
- `pnpm test` passed.
- `pnpm boundaries` passed.
- `pnpm build` passed.
