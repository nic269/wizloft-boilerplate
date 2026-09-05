# Personal SaaS Boilerplate

A reusable monorepo starter for Anh Nguyen's future SaaS, education, internal tools, and Shopify-adjacent products.

## Stack

- pnpm 11.23 via Corepack, Node.js 24 LTS, Turborepo
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
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

If another local Postgres already uses `5432`, start this repo on another host
port and update `DATABASE_URL` accordingly:

```bash
POSTGRES_PORT=5434 docker compose up -d postgres
DATABASE_URL=postgresql://postgres:postgres@localhost:5434/personal_saas_boilerplate pnpm db:migrate:deploy
```

After changing the Prisma schema, create a migration with
`pnpm db:migrate:dev --name <migration-name>`. Keep `pnpm db:push` for rapid
prototyping against disposable databases only; it does not reproduce raw SQL
constraints from the checked-in migration history.

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
corepack pnpm boilerplate:init ../my-product --name "My Product" --validate
corepack pnpm boilerplate:init ../my-core --profile core --validate
```

The default `saas` profile preserves the full app, web, API, email, and
Storybook baseline. The `core` profile keeps only identity, auth recovery,
session management, health/readiness, and neutral protected UI on a four-model
Prisma schema. Add docs with `--with-docs`, or select an exact app set with
`--apps app,api,web`; app and API are always required. Every generated project
contains a passive `boilerplate.receipt.json` with its selected profile,
surfaces, source identity when Git metadata is available, and a deterministic
pre-install source digest. Builds and runtime behavior never read the receipt.

`--skip-install` removes the copied lockfile. Run `corepack pnpm install` in the
generated project before using `--frozen-lockfile`.

Maintainers can verify every supported profile/app combination in isolated,
target-owned workspaces:

```bash
corepack pnpm profiles:verify --full
corepack pnpm profiles:verify --case core:app,api --runtime
```

The full mode installs, lints, typechecks, checks boundaries, and builds all 32
combinations. Runtime mode additionally runs the generated release, isolated
database/browser, and production-container checks for each explicit `--case`.
Reports are written under `.data/`; generated targets are removed unless
`--keep` is passed.

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
starting from `POSTGRES_PORT` or `5432`, deploys the checked-in migrations, then runs
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

- Runtime apps under `apps/*` are independently deployable; email preview and
  Storybook are workspace tooling surfaces rather than production runtimes.
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
- Optional integrations do not crash when env vars are absent locally. Enabled
  production auth delivery features require a configured mail provider, and
  explicitly selected S3-compatible providers fail startup when incomplete.
