# Deployment Guide

This boilerplate treats every `apps/*` surface as independently deployable. Local development may use the root `.env`
file, but production environments must inject variables through the hosting platform.

## Deployable Surfaces

| Surface | Package | Default Port | Notes |
| --- | --- | --- | --- |
| Product app | `@repo/app` | `3000` | Next.js App Router, same-origin rewrites to API. |
| Marketing site | `@repo/web` | `3001` | Static-friendly Next.js surface. |
| API service | `@repo/api-app` | `3002` | Hono Node server for auth, API, health, and OpenAPI. |
| Docs | `@repo/docs` | `3003` | Static-friendly Next.js handoff surface. |
| Email previews | `@repo/email-app` | `3004` | Development preview surface, not a production runtime. |
| Storybook | `@repo/storybook` | `6006` | Build artifact for design-system review. |

## Required Production Steps

1. Provision PostgreSQL.
2. Inject the required env vars for the selected app surface.
3. Run `pnpm db:migrate:deploy` before promoting app/API traffic.
4. Build the selected surface with Turbo filtering.
5. Start the selected app with its package `start` script.

## Docker And Turbo Prune

The root `Dockerfile` keeps one prune/build pipeline and exposes separate
runtime targets for app, API, and web:

```bash
docker build --target app-runner --build-arg APP_SCOPE=@repo/app -t personal-saas-app .
docker build --target api-runner --build-arg APP_SCOPE=@repo/api-app -t personal-saas-api .
docker build --target web-runner --build-arg APP_SCOPE=@repo/web -t personal-saas-web .
```

Next.js runners copy only standalone output and static assets. The API build
uses `tsup` to compile workspace source into a CommonJS service artifact while
leaving npm packages in the pruned production dependency graph. The API runner
installs only that production graph, copies the compiled `apps/api/dist`
artifact from the build stage, copies the generated Prisma Client payload
needed by the compiled runtime, and starts the API with
`node /app/apps/api/dist/index.cjs` plus env injected by the platform.

Run the containers with platform-provided environment variables:

```bash
docker run --rm -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://postgres:postgres@host.docker.internal:5432/personal_saas_boilerplate \
  -e NEXT_PUBLIC_APP_URL=http://localhost:3000 \
  -e NEXT_PUBLIC_WEB_URL=http://localhost:3001 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3002 \
  -e BETTER_AUTH_SECRET=replace-with-a-production-secret \
  -e BETTER_AUTH_URL=http://localhost:3002/api/auth \
  personal-saas-app
```

Do not copy `.env` into production images. `.dockerignore` excludes local env files and build outputs.

The API surface should receive a real `PORT` value from the platform. The
server now prefers `PORT` for binding and explicitly listens on `0.0.0.0`,
which is the portable container-safe behavior.

Local API development still uses `tsx watch`, but production images do not
execute TypeScript source or use `tsx` as the process runtime.

## Local Runtime Validation

Use one command to build and boot the app, API, and web production images on a
temporary Docker network:

```bash
pnpm docker:validate
```

The script:

- builds `api-runner`, `app-runner`, and `web-runner`
- injects runtime env directly instead of copying `.env`
- waits for `GET /health` on API, `GET /sign-in` on app, and `GET /` on web
- preserves stopped containers long enough to report startup logs
- removes temporary containers, images, and the Docker network when finished

This command is the local portability proof. Hosting-provider image push,
managed ingress, and secret delivery still belong to the deployment platform.

## CI Contract

`.github/workflows/ci.yml` runs the baseline validation ladder:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm templates:validate
pnpm check:ci
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

The workflow starts a PostgreSQL service and injects CI env vars directly.

Run the same release ladder locally before cutting a reusable boilerplate fork:

```bash
pnpm release:check
```

This command validates template catalog drift before the normal lint, type,
test, boundary, and build checks.

Production deployments should use `pnpm db:migrate:deploy` before promoting
application traffic. The checked-in initial migration supports clean project
forks; existing databases created with `db:push` must be baselined deliberately
before adopting migration deploy.

Optional providers follow one deployment rule: absent integrations stay
disabled or local, while explicitly selected `resend`, `smtp`, `s3`, or `r2`
providers must have all required variables. The API exits before listening when
production provider configuration is incomplete. `/ready` reports provider
state diagnostics but keeps optional providers separate from database
readiness.

The final fork-readiness audit lives in `docs/release-readiness.md`.

## Follow-Ups

- Add provider-specific deployment smoke checks when choosing a hosting platform.
- Add live mail, storage, and job delivery checks only in environments with credentials.
- Promote `pnpm test:e2e:db` into CI when pull request runtime budget allows a browser smoke.
