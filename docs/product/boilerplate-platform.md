# Boilerplate Platform Product Contract

## Goal

Provide a reusable, production-ready SaaS monorepo foundation that can start future apps without carrying any Ops Hub
domain assumptions.

## Core Behaviors

- Manifest-driven `pnpm boilerplate:init <target>` generation separates the
  internal boilerplate factory from clean application projects. The generator
  rewrites identity and selected app surfaces while stripping Harness, agent,
  planning, release-manifest, and domain-template artifacts.
- Config-driven workspace guardrails enforce app isolation, public package
  exports, declared dependencies, core package layers, Client Component safety,
  and an acyclic workspace dependency graph.
- Strict Turborepo environment contracts hash task-relevant values while the
  root `.env` remains the single local-development source of truth.

- Multi-app monorepo with independent deployable surfaces.
- Better Auth server/client package split.
- Same-origin auth/API rewrites from `apps/app` to `apps/api`.
- Email/password auth pages call Better Auth through same-origin `/api/auth` and protected app pages read the current
  server session.
- Generic Prisma schema for auth, organizations, RBAC, invitations, audit, files, webhooks, jobs, integrations, and flags.
- Membership-scoped organization onboarding that atomically provisions an Owner role, baseline permissions, creator
  membership, and an audit record.
- Permissioned invitation lifecycle with hashed tokens, optional mail delivery, exact-email acceptance, Member role
  activation, revocation, and audit evidence.
- Organization-scoped role management with a whitelist permission catalog, member role assignment, and recent audit log
  review.
- Hono API contract registry with stable procedure IDs, RPC-style health procedures, typed client helpers, and OpenAPI
  paths generated from the same registry.
- Optional mail, storage, jobs, billing, analytics, CMS, and observability packages that degrade gracefully. Mail falls
  back to console delivery, storage supports local/memory/S3-compatible private objects, and jobs include a local
  in-process provider with idempotency, retry, and run status.
- A source-owned design-system with the complete shadcn Base UI component set,
  stable component subpath exports, and generic helper packages.
- Handoff surfaces for future products: docs app, React Email previews, Storybook design-system examples, and template
  tracks for base SaaS, education, dev tools, and Shopify-adjacent add-ons.
- Production discipline with standalone Next.js outputs, per-surface start scripts, Turbo-pruned Docker builds, CI
  validation, and deployment docs.
- Design-system provider ownership with reusable theme, tooltip, and toast providers. App, web, docs, and Storybook surfaces own local
  Tailwind entry stylesheets, source scanning, and CSS override seams. Shared design-system globals provide reusable
  token variables, dark tokens, base rules, and token utility classes without leaking raw Tailwind directives into app
  output.
- Maintenance commands separate dependency cleanup, build artifact cleanup, dependency upgrades, Prisma Studio, and
  shadcn component generation.
- Template tracks are code-owned through a typed catalog, docs app rendering, and CLI validation/list commands so future
  products can select add-ons without copying domain code into core.
- CI and local release readiness both validate template catalog drift before lint, type, test, boundary, and production
  build checks.
- Domain template tracks stay as guidance until a concrete project selects one; executable domain scaffold code should
  be added only when the selected project can validate it.

## Non-Goals

- DHL, Evisu, preorder, return, import executor, Shopify workflow, brand asset, secret, or store-specific code in core.
- A complete LMS, dev-tools, or Shopify app domain implementation in the base scaffold.

## Validation

- `pnpm install`
- `pnpm check`
- `pnpm check-types`
- `pnpm dev`
- `pnpm boundaries`
- `pnpm build`
- `pnpm test:e2e` for the auth smoke when a migrated PostgreSQL database is available.
- `pnpm test:e2e:db` for local auth E2E with automatic Docker Compose PostgreSQL bootstrap.
- `pnpm clean:deps`, `pnpm clean:build`, `pnpm upgrade:deps`, `pnpm db:studio`, and `pnpm ui:gen` for maintenance
  workflows.
- `pnpm templates:list`, `pnpm templates:json`, and `pnpm templates:validate` for template track handoff and drift
  checks.
- `pnpm release:check` for the local pre-release ladder matching CI's non-E2E validation contract.
- `docs/release-readiness.md` for the final readiness audit, caveats, and template scaffold decision.
