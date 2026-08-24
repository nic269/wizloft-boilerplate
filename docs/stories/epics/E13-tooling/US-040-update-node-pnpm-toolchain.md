# US-040 Update Node and pnpm Toolchain

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate installs, validates in CI, and builds production containers with
Node.js 24 LTS and pnpm 11.23.0 through Corepack.

## Relevant Product Docs

- `README.md`

## Acceptance Criteria

- Root package metadata requires Node.js 24 and pnpm 11.23.0 or newer.
- CI uses Node.js 24.
- Every production container stage derives from the Node.js 24 image.
- The documented stack matches the supported runtime versions.

## Design Notes

- Node.js 24 is the current active LTS line; retain the repository's major-line
  runtime pins for CI and Docker image updates.
- Pin pnpm exactly in `packageManager` so Corepack resolves a reproducible
  package-manager release.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Not applicable; configuration-only change |
| Integration | `pnpm install --frozen-lockfile` |
| E2E | Not required; no product behavior changes |
| Platform | `pnpm templates:validate`, `pnpm check-types` |
| Release | Not required for this bounded runtime configuration change |

## Harness Delta

- The required Harness CLI and project-scoped intake skill are absent from this
  checkout, so the intake and trace cannot be persisted to the durable database.

## Evidence

- `corepack pnpm install --frozen-lockfile` passed with pnpm 11.23.0.
- `corepack pnpm templates:validate` passed.
- `corepack pnpm db:generate && corepack pnpm check-types` passed on Node.js
  24.19.0.
- `corepack pnpm docker:validate` passed after building the API, app, and web
  production images from `node:24-alpine` with pnpm 11.23.0, checking invalid
  S3 and mail configuration rejections, and reaching each surface's HTTP probe.
- `corepack pnpm check:ci` remains blocked by PostCSS lint and formatting
  failures in the app, docs, web, Storybook, and design-system configuration
  files; none is changed by this story.
- `corepack pnpm test` passed.
- `corepack pnpm boundaries` passed.
- `corepack pnpm build` failed with the local `.env` because the three required
  public URLs were unset; the same build passed when run with the CI workflow's
  environment variables.
