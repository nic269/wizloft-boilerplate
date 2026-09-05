# wizloft-boilerplate

## Purpose

Provide a reusable monorepo starter for SaaS, education, internal-tool, and
Shopify-adjacent products. The repository also owns a generator that creates a
clean product project without boilerplate-authoring or repository-local Harness
state.

## Current Architecture

- pnpm/Turborepo monorepo using TypeScript strict mode.
- Next.js App Router surfaces under `apps/`, with a Hono API and contract-first
  oRPC boundary.
- Better Auth, Prisma/PostgreSQL, shared workspace packages, and a source-owned
  shadcn Base UI design system.
- Optional integrations fail clearly when selected but remain safe to omit in
  the base product.
- `scripts/boilerplate-init/cli.ts` is the generator entrypoint.

## Development Constraints

- Preserve app/package dependency direction and declared workspace exports.
- Parse unknown input at system boundaries; keep authorization database-backed
  and separate from browser-safe static policy.
- Keep generated projects free of source-only docs, agent tooling, plans,
  templates, and `.wizloft/` state.
- Use migration-first database changes and keep `.env` files and credentials
  untracked.
- Run the narrowest relevant checks first; `pnpm release:check` is the full
  repository release gate.
