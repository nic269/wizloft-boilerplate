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

The root `Dockerfile` supports a pruned build context by package scope:

```bash
docker build --build-arg APP_SCOPE=@repo/app -t personal-saas-app .
docker build --build-arg APP_SCOPE=@repo/api-app -t personal-saas-api .
docker build --build-arg APP_SCOPE=@repo/web -t personal-saas-web .
docker build --build-arg APP_SCOPE=@repo/docs -t personal-saas-docs .
```

Run the container with platform-provided environment variables:

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

## CI Contract

`.github/workflows/ci.yml` runs the baseline validation ladder:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm db:push
pnpm check:ci
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

The workflow starts a PostgreSQL service and injects CI env vars directly.

## Follow-Ups

- Add provider-specific deployment smoke checks when choosing a hosting platform.
- Add live mail, storage, and job provider checks only in environments with credentials.
- Add E2E CI once the one-command auth E2E database bootstrap backlog item is complete.
