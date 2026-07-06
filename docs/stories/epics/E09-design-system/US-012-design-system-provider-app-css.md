# US-012 Add Design-System Provider And App CSS Override Seam

## Status

implemented

## Lane

normal

## Product Contract

The boilerplate should adopt the useful next-forge pattern where the design-system package owns common providers and
the product app imports a local app stylesheet that can override shared design-system styles without editing package
globals.

## Relevant Product Docs

- `docs/product/boilerplate-platform.md`
- `apps/app/app/layout.tsx`
- `packages/design-system/src/index.ts`
- `packages/design-system/src/styles/globals.css`

## Acceptance Criteria

- `@repo/design-system` exports a `DesignSystemProvider`.
- Theme management uses a design-system-owned provider.
- `apps/app` imports a local `app/styles.css` file instead of directly importing shared design-system CSS.
- App-local stylesheets are the Tailwind entrypoints, import shared design-system CSS, declare local Tailwind source
  ownership, and document where app-specific overrides belong.
- Storybook imports the design-system stylesheet through a local Storybook stylesheet, wraps stories with the
  design-system provider, and does not auto-open a browser during development.
- Design-system globals provide shared token variables, base rules, and token utility classes without leaking raw
  Tailwind directives into app/browser CSS.
- Validation passes for formatting/lint, typecheck, unit tests, boundaries, and build.

## Design Notes

- Commands: no runtime command changes.
- Queries: no data queries added.
- API: no API contract changes.
- Tables: no schema changes.
- Domain rules: no product-domain behavior changed.
- UI surfaces: app layout provider seam and CSS import chain.

## Source Comparison

Source: `/Volumes/anh.nguyen/Projects/AnhN/next-forge`

| Decision | Source's Way | Local Way | Recommendation |
| --- | --- | --- | --- |
| Provider ownership | Design-system exports a provider with theme/auth/tooltip/toaster | No provider seam yet | Add provider seam now, keep only theme until primitives exist |
| Theme | `next-themes` with class attribute | No theme provider | Adopt `next-themes` |
| App CSS | App-local `styles.css` imports shared globals | App imports package CSS directly | Add app-local stylesheet |
| Tailwind source ownership | Design-system sources package files; app surfaces own local CSS imports | Design-system hardcoded app paths | Move app source declarations into app-local stylesheets |
| Storybook styling | Preview imports design-system globals and wraps stories with providers | Storybook imported package CSS directly | Add Storybook-local stylesheet and provider decorator |
| Shared tokens | Rich shadcn token set with Tailwind v4 processing in each surface | Minimal token set | Adopt the token/base-layer model, but keep Tailwind entrypoint processing in each app surface |
| Animation CSS | `tw-animate-css` import in globals | Turbopack cannot resolve its style export through workspace CSS | Install dependency but defer import until resolver support or component need |
| Auth/toast coupling | Provider wraps auth/toaster | Auth and toast primitives differ locally | Do not copy these wrappers |

## Validation

When updating durable proof status, use numeric booleans:
`scripts/bin/harness-cli story update --id US-012 --unit 1 --integration 1 --e2e 0 --platform 1`.

| Layer | Expected proof |
| --- | --- |
| Unit | `pnpm test` remains green. |
| Integration | `pnpm check-types` proves provider exports and app layout imports. |
| E2E | Not required; no user workflow changed. |
| Platform | `pnpm check:ci`, `pnpm boundaries`, and `pnpm build` pass. |
| Release | Product docs mention provider/CSS override pattern. |

## Harness Delta

- None expected.

## Evidence

- Used `ck:xia` against `/Volumes/anh.nguyen/Projects/AnhN/next-forge` and ported only the provider/theme and app-local
  stylesheet seam.
- Added `next-themes` to `@repo/design-system`.
- Added `ThemeProvider` and `DesignSystemProvider` exports.
- Updated `apps/app/app/layout.tsx` to wrap children in `DesignSystemProvider` and set `suppressHydrationWarning`.
- Added `apps/app/app/styles.css` importing shared design-system styles and documenting app-specific overrides.
- Updated design-system globals to source only package files instead of hardcoding app paths.
- Added local stylesheets for `apps/web`, `apps/docs`, and Storybook so each surface owns its Tailwind source scan and
  override seam.
- Added shared `@repo/design-system/postcss.config.mjs` and app-level re-exports so `apps/app`, `apps/web`,
  `apps/docs`, and `apps/storybook` all run `@tailwindcss/postcss`.
- Kept app-local CSS as the Tailwind entrypoint (`@import "tailwindcss"` plus per-surface `@source` rules) and kept
  design-system globals as runtime token/base CSS. This avoids the Next/Turbopack failure mode where workspace package
  CSS is imported as plain CSS and raw `@source`/`@theme`/`@apply` leaks to the browser.
- Ported the next-forge/shadcn token/base model into design-system globals: shared color/radius variables, dark tokens,
  base rules, and reusable token utility classes.
- Installed Tailwind/typography/animation dependencies needed by app surfaces and design-system. `tw-animate-css` is
  intentionally not imported yet because Next/Turbopack does not resolve its style export through workspace CSS in this
  pnpm setup.
- Updated Storybook preview to import its local stylesheet and wrap stories in `DesignSystemProvider`.
- Updated Storybook dev script with `--no-open`.
- Added `clean:deps`, `clean:build`, `upgrade:deps`, `db:studio`, and `ui:gen` commands.
- Fixed React Email preview templates to render through source-relative concrete preview wrappers.
- `pnpm --filter @repo/storybook check-types` passed.
- `pnpm --filter @repo/storybook build` passed. Storybook emitted default asset-size warnings.
- React Email preview server rendered `invite-user`, `password-reset`, and `verification` successfully after clean start.
- `pnpm install` passed and updated `pnpm-lock.yaml`.
- `pnpm check:ci` passed: 199 files.
- `pnpm check-types` passed: 24/24 packages.
- `pnpm test` passed: 24/24 package tasks.
- Focused CSS builds passed: `pnpm --filter @repo/web build`, `pnpm --filter @repo/docs build`, and
  `pnpm --filter @repo/storybook build`.
- CSS artifact inspection passed: no raw `@apply`, `@source`, or `@theme` remained in `web`, `docs`, or Storybook
  output, and generated utilities such as `.min-h-screen`, `.mx-auto`, `.text-5xl`, `.bg-background`, and `.rounded-md`
  were present.
- `pnpm boundaries` passed.
- `pnpm build` passed: 8/8 build tasks. Storybook emitted default asset-size warnings.
