# Personal SaaS Boilerplate

A reusable monorepo starter for Anh Nguyen's future SaaS, education, internal tools, and Shopify-adjacent products.

## Stack

- pnpm 10, Node.js 22, Turborepo
- TypeScript strict and Ultracite-on-Biome linting
- Next.js App Router for app/web/docs
- Hono API service
- Better Auth with Prisma/PostgreSQL
- Complete shadcn Base UI design-system package
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
cp .env.example .env
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
pnpm release:check
```

Maintenance commands:

```bash
pnpm clean:deps
pnpm clean:build
pnpm upgrade:deps
pnpm db:studio
pnpm ui:gen
pnpm templates:list
pnpm templates:validate
```

Create a clean project without the source repo's Harness and agent tooling:

```bash
pnpm boilerplate:init ../my-product --name "My Product" --validate
```

The default output includes app, web, API, email, and Storybook surfaces. Add
docs with `--with-docs`, or select an exact set with
`--apps app,api,web`. App and API are required. This generator core is designed
to become the implementation behind `wizloft boilerplate init` later.

Shadcn components are source-owned by `@repo/design-system` and available
through explicit subpath imports:

```tsx
import { Dialog, DialogContent } from "@repo/design-system/components/ui/dialog";
import { Select, SelectItem } from "@repo/design-system/components/ui/select";
```

The package provider owns theme, tooltip, and toast providers. Run
`pnpm ui:gen <component>` when adding or refreshing a registry component.

Before promoting a fork or template change, run:

```bash
pnpm release:check
```

This mirrors the local release ladder: template drift validation, Ultracite,
TypeScript, tests, package boundaries, and production builds.

For a local auth E2E smoke with automatic PostgreSQL bootstrap:

```bash
pnpm test:e2e:db
```

This starts the Docker Compose `postgres` service, picks an available host port
starting from `POSTGRES_PORT` or `5432`, pushes the Prisma schema, then runs
Playwright. Use `pnpm test:e2e` directly when a migrated database is already
available.

CI uses the non-mutating formatter/linter command:

```bash
pnpm check:ci
```

Deployment notes live in [`docs/deployment.md`](docs/deployment.md). The root
`Dockerfile` supports Turbo-pruned images with `APP_SCOPE`, for example:

```bash
docker build --build-arg APP_SCOPE=@repo/app -t personal-saas-app .
```

Release readiness and template scaffold guidance live in
[`docs/release-readiness.md`](docs/release-readiness.md).

## Architecture Rules

- `apps/*` are independently deployable.
- `apps/*` must not import from other `apps/*`.
- `packages/*` must not import from `apps/*`.
- Workspace imports must be declared and use package export maps.
- Client Components must use only configured client-safe package entrypoints.
- Core package layers and dependency cycles are enforced by
  `boundaries.config.json` and `pnpm boundaries`.
- Root `.env` is the single local-development env file. Root and direct workspace commands load it through `dotenv-cli`.
- Turborepo uses strict env mode; task env declarations are validated against
  the aggregate root `.env.example` contract.
- Packages own reusable `keys.ts` contracts with `@t3-oss/env-core`.
- Next apps compose package contracts with `@t3-oss/env-nextjs`; the Hono API uses `@t3-oss/env-core`.
- Production deployments inject environment variables through their platform; they do not depend on a checked-in `.env` file.
- Optional integrations must not crash the app when env vars are missing.

## Generic Core

This boilerplate intentionally excludes Ops Hub domain code:

- no DHL logic
- no Evisu-specific returns/preorders/import executors
- no Shopify-specific workflow rules in core
- no brand assets
- no secrets

Shopify, education, dev-tools, and import/export behavior should live in `templates/*` or future add-on packages.
