# 0008 Personal SaaS Boilerplate Architecture

Date: 2026-07-05

## Status

Accepted

## Context

The supplied v2 spec asks for a new generic personal SaaS boilerplate from scratch. The work touches auth,
authorization, database schema, public API shape, provider integrations, deployment boundaries, and validation
expectations.

## Decision

Use a pnpm/Turborepo monorepo with workspace surfaces under `apps/*`,
independently deployable runtime apps, and explicit package entrypoints under
`packages/*`.

The base architecture uses:

- Next.js App Router for app, web, and docs surfaces.
- Hono for the API/auth service.
- Better Auth with a source-only `@repo/auth` package split into server, client, middleware, permissions,
  invitations, and env entrypoints.
- Prisma/PostgreSQL in `@repo/database` with generic organization/RBAC/invite/audit/platform tables.
- Optional provider abstractions for mail, storage, jobs, billing, analytics, CMS, observability, and flags.
- Root `.env.example` for onboarding plus per-app typed `env.ts` files as
  surface-owned env contracts.
- A boundary script that forbids app-to-app imports and package-to-app imports.

## Alternatives Considered

1. Single overloaded Next.js app: rejected because runtime, documentation,
   preview, and review surfaces need separate ownership and build boundaries.
2. Copying Ops Hub directly: rejected because the boilerplate must stay generic and exclude domain-specific code.
3. Root-only env contract: rejected because each app surface needs its own env
   ownership.

## Consequences

Positive:

- Future products can opt into only the surfaces and providers they need.
- Auth, database, API, and provider boundaries are explicit and reusable.
- Domain templates can grow without bloating core.

Tradeoffs:

- The initial package count is higher than a single-app starter.
- Some modules are intentionally skeletal until a concrete product story exercises them.

## Follow-Up

- Add real auth form actions and invite acceptance UI.
- Add Hono/oRPC contract generation once concrete API routes grow beyond health/org scaffolding.
- Add CI after dependency installation is verified.
