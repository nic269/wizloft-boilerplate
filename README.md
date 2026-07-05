# Personal SaaS Boilerplate

A reusable monorepo starter for Anh Nguyen's future SaaS, education, internal tools, and Shopify-adjacent products.

## Stack

- pnpm 10, Node.js 22, Turborepo
- TypeScript strict and Biome
- Next.js App Router for app/web/docs
- Hono API service
- Better Auth with Prisma/PostgreSQL
- shadcn-style design-system package
- Vitest and Playwright
- Optional provider abstractions for mail, storage, jobs, billing, analytics, CMS, and observability

## Apps

| App | Purpose | Port |
| --- | --- | --- |
| `apps/app` | Authenticated product app | 3000 |
| `apps/web` | Marketing/public site | 3001 |
| `apps/api` | Hono API, auth, health, OpenAPI | 3002 |
| `apps/docs` | Docs/help/API handoff surface | 3003 |
| `apps/email` | React Email previews | 3004 |
| `apps/storybook` | Design-system playground | 6006 |

## First Run

```bash
pnpm install
cp .env.example .env.local
docker compose up -d postgres
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
```

If another local Postgres already uses `5432`, start this repo on another host
port and update `DATABASE_URL` accordingly:

```bash
POSTGRES_PORT=5434 docker compose up -d postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm db:push
```

Useful checks:

```bash
pnpm check
pnpm check-types
pnpm test
pnpm boundaries
```

## Architecture Rules

- `apps/*` are independently deployable.
- `apps/*` must not import from other `apps/*`.
- `packages/*` must not import from `apps/*`.
- Apps own `env.ts` and compose only the package env fragments they use.
- Root `.env.example` is onboarding only, not the production env contract.
- Optional integrations must not crash the app when env vars are missing.

## Generic Core

This boilerplate intentionally excludes Ops Hub domain code:

- no DHL logic
- no Evisu-specific returns/preorders/import executors
- no Shopify-specific workflow rules in core
- no brand assets
- no secrets

Shopify, education, dev-tools, and import/export behavior should live in `templates/*` or future add-on packages.
