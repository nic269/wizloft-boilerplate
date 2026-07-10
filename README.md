# Personal SaaS Boilerplate

A reusable monorepo starter for Anh Nguyen's future SaaS, education, internal tools, and Shopify-adjacent products.

## Stack

- pnpm 10, Node.js 22, Turborepo
- TypeScript strict and Ultracite-on-Biome linting
- Next.js App Router for app/web/docs
- Hono API service with contract-first oRPC and generated OpenAPI
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
pnpm docker:validate
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

Product UI consumes internal APIs through `@repo/api/client`. Browser-safe
contracts under `packages/api/src/contracts` drive runtime validation, OpenAPI,
and typed browser/server clients; server implementations remain under
`packages/api/src/routers`.

Before promoting a fork or template change, run:

```bash
pnpm release:check
```

This mirrors the local release ladder: template drift validation, Ultracite,
TypeScript, tests, package boundaries, and production builds.

For local auth, organization-isolation, and invitation E2E smoke coverage with
automatic PostgreSQL bootstrap:

```bash
pnpm test:e2e:db
```

This starts the Docker Compose `postgres` service, picks an available host port
starting from `POSTGRES_PORT` or `5432`, pushes the Prisma schema, then runs
Playwright on desktop and mobile profiles. The bootstrap owns its local service
URLs and starts fresh app/API servers so a running development process cannot
silently point the suite at another database. Use `pnpm test:e2e` directly when
a migrated database is already available.

CI uses the non-mutating formatter/linter command:

```bash
pnpm check:ci
```

Deployment notes live in [`docs/deployment.md`](docs/deployment.md). The root
`Dockerfile` supports Turbo-pruned images with surface-specific runtime targets,
for example:

```bash
docker build --target app-runner --build-arg APP_SCOPE=@repo/app -t personal-saas-app .
docker build --target api-runner --build-arg APP_SCOPE=@repo/api-app -t personal-saas-api .
docker build --target web-runner --build-arg APP_SCOPE=@repo/web -t personal-saas-web .
```

For a repeatable local production-runtime smoke across app, API, and web:

```bash
pnpm docker:validate
```

Release readiness and template scaffold guidance live in
[`docs/release-readiness.md`](docs/release-readiness.md).

## Architecture Rules

- `apps/*` are independently deployable.
- `apps/*` must not import from other `apps/*`.
- `packages/*` must not import from `apps/*`.
- Workspace imports must be declared and use package export maps.
- Static permission policy belongs to browser-safe `@repo/access-control`;
  database-backed authorization belongs to `@repo/auth`.
- Client Components must use only configured client-safe package entrypoints.
- Core package layers and dependency cycles are enforced by
  `boundaries.config.json` and `pnpm boundaries`.
- Root `.env` is the single local-development env file. Root and direct workspace commands load it through `dotenv-cli`.
- Turborepo uses strict env mode; task env declarations are validated against
  the aggregate root `.env.example` contract.
- Packages own reusable `keys.ts` contracts with `@t3-oss/env-core`.
- Next apps compose package contracts with `@t3-oss/env-nextjs`; the Hono API uses `@t3-oss/env-core`.
- Production deployments inject environment variables through their platform; they do not depend on a checked-in `.env` file.
- Optional integrations do not crash when env vars are absent. Explicitly
  selected production mail or S3-compatible providers fail startup when their
  required configuration is incomplete.
