# Personal SaaS Boilerplate v2

This repo implements the supplied `personal-saas-boilerplate-v2-spec.md` as a generic monorepo foundation for Anh
Nguyen's future apps.

Core stack:

- pnpm 10 and Turborepo
- Biome
- TypeScript strict
- Next.js App Router
- Hono API
- Better Auth
- Prisma and PostgreSQL
- shadcn-style `@repo/design-system`
- Vitest and Playwright

Reference rules:

- Current Ops Hub code is only a pattern reference.
- No DHL, Evisu, returns, preorders, Shopify workflow, brand asset, store config, or secret code belongs in core.
- next-forge is a structure reference for app separation and production monorepo discipline.
- Supastarter is architectural inspiration only.

App surfaces:

- `apps/app`: authenticated product app, port 3000.
- `apps/web`: marketing/public site, port 3001.
- `apps/api`: Hono API/auth/health service, port 3002.
- `apps/docs`: docs surface, port 3003.
- `apps/email`: React Email previews, port 3004.
- `apps/storybook`: design-system playground, port 6006.

Core packages:

- `@repo/api`
- `@repo/auth`
- `@repo/database`
- `@repo/design-system`
- `@repo/config`
- `@repo/logger`
- `@repo/helpers`
- `@repo/mail`
- `@repo/storage`
- `@repo/jobs`
- optional shells for billing, analytics, CMS, i18n, flags, observability, security, and test helpers.

Environment model:

- Root `.env.example` is aggregate local onboarding.
- Each deployable app owns `env.ts`.
- Package-level env requirements are exported through `keys.ts` using `@t3-oss/env-core`.
- Next apps use `@t3-oss/env-nextjs` and compose package contracts with `extends`.
- Optional integrations disable or use mock/noop/local providers when env vars are missing.

Deployment boundary:

- `apps/*` must not import from other `apps/*`.
- `packages/*` must not import from `apps/*`.
- Apps may import explicit `@repo/*` package entrypoints.
