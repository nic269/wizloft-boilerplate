# Boilerplate Platform Product Contract

## Goal

Provide a reusable, production-ready SaaS monorepo foundation that can start future apps without carrying any Ops Hub
domain assumptions.

## Core Behaviors

- Manifest-driven `pnpm boilerplate:init <target>` generation separates the
  internal boilerplate factory from clean application projects. The generator
  rewrites identity and selected app surfaces while stripping Harness, agent,
  planning, release-manifest, and domain-template artifacts. Generated projects
  also remove source-only template catalog exports, record selected deployable
  surfaces independently from product feature flags, and avoid carrying a stale
  source lockfile when installation is skipped.
- Config-driven workspace guardrails enforce app isolation, public package
  exports, declared dependencies, core package layers, Client Component safety,
  explicit package policy coverage, package-name imports across workspaces, and
  an acyclic workspace dependency graph.
- Strict Turborepo environment contracts hash task-relevant values while the
  root `.env` remains the single local-development source of truth.
- Checked-in migrations are the database lifecycle source of truth for fresh
  local setup, CI, isolated E2E, and production. Schema push remains available
  only for disposable prototyping because it cannot reproduce raw SQL migration
  contracts.
- Multi-app monorepo with independent deployable surfaces.
- Better Auth server/client package split.
- Same-origin auth/API rewrites from `apps/app` to `apps/api`.
- Email/password auth pages call Better Auth through same-origin `/api/auth` and
  protected app pages read the current server session. Browser reset-password
  and verify/resend screens call Better Auth through the same client boundary.
  Better Auth verification and password-reset delivery use the shared
  `@repo/mail` provider and React Email templates.
- Shared session and permission helpers treat only `ACTIVE` users as
  authenticated or authorized; suspended and invited users cannot access
  protected app/API surfaces through existing sessions.
- Generic Prisma schema for auth, organizations, RBAC, invitations, audit,
  files, webhooks, jobs, integrations, and globally or organization-scoped
  flags. The schema ships with an initial production migration, query indexes,
  provider idempotency constraints, organization-owned integration integrity,
  invitation-role integrity, and catalog-reconciled system-role seed data.
- Membership-scoped organization onboarding that atomically provisions an Owner role, baseline permissions, creator
  membership, and an audit record.
- Permissioned invitation lifecycle with hashed tokens, feature-gated mail delivery, exact-email acceptance, durable
  expiry, Member role activation, revocation, and audit evidence.
- Organization-scoped role management with a whitelist permission catalog, member role assignment, and recent audit log
  review. Role assignment preserves the ownership invariant by rejecting
  updates that would leave an organization without an active seeded system
  Owner. Owner-boundary mutations use Serializable retries and require an
  active system Owner or active super admin.
- Dependency-free `@repo/access-control` policy shared by auth, API, UI,
  provisioning, and seed workflows; database-backed authorization remains in
  `@repo/auth`.
- Contract-first oRPC schemas drive Hono runtime handling, Zod input/output
  validation, generated OpenAPI, stable operation IDs, and typed browser/server
  clients. API error envelopes include the request ID in both Hono and oRPC
  responses. Health surfaces are `/health`, `/ready`, and `/status`; provisional
  legacy RPC aliases are not part of the current contract.
- API liveness and readiness are separate operational signals: `/health` is a
  cheap process check, while `/ready` verifies database connectivity and the
  providers required by enabled production features, returning `503 Service
  Unavailable` when the API should not receive traffic.
- Optional mail, storage, jobs, billing, analytics, CMS, and observability
  packages that degrade gracefully when disabled. Mail supports console,
  Resend, and SMTP delivery; storage supports local, memory, S3, and R2 private
  objects; jobs include a local in-process provider with idempotency, retry,
  and async run status. Provider diagnostics distinguish disabled, configured,
  and misconfigured states without exposing credentials. Local storage is
  described as local rather than durable. Enabled auth delivery requires real
  production mail, and explicitly selected S3-compatible providers fail
  production API startup when required values are missing.
- Organization members, roles, invitations, and audit logs use deterministic
  opaque cursor pagination with bounded limits and `pageInfo.nextCursor`.
- A source-owned design-system with the complete shadcn Base UI component set,
  stable component subpath exports, and generic helper packages.
- Handoff surfaces for future products: docs app, React Email previews, Storybook design-system examples, and template
  tracks for base SaaS, education, dev tools, and Shopify-adjacent add-ons.
- Production discipline with standalone Next.js outputs, per-surface start scripts, Turbo-pruned Docker builds, target-
  specific runtime images for app/API/web, CI validation, and deployment docs.
- Design-system provider ownership with reusable theme, tooltip, and toast providers. App, web, docs, and Storybook surfaces own local
  Tailwind entry stylesheets, source scanning, and CSS override seams. Shared design-system globals provide reusable
  token variables, dark tokens, base rules, and token utility classes without leaking raw Tailwind directives into app
  output.
- Maintenance commands separate dependency cleanup, build artifact cleanup, dependency upgrades, Prisma Studio, and
  shadcn component generation.
- Template tracks are code-owned through a typed catalog, docs app rendering, and CLI validation/list commands so future
  products can select add-ons without copying domain code into core.
- Generated projects keep tests and CI visible to review tooling through a
  generated `.repomixignore`, and generated Docker contexts omit only runtime
  noise rather than source Harness bookkeeping entries.
- CI and local release readiness both validate template catalog drift before lint, type, test, boundary, and production
  build checks.
- Domain template tracks stay as guidance until a concrete project selects one; executable domain scaffold code should
  be added only when the selected project can validate it.

## Non-Goals

- DHL, preorder, return, import executor, Shopify workflow, brand asset, secret, or store-specific code in core.
- A complete LMS, dev-tools, or Shopify app domain implementation in the base scaffold.

## Validation

- `pnpm install`
- `pnpm check`
- `pnpm check-types`
- `pnpm dev`
- `pnpm boundaries`
- `pnpm build`
- `pnpm test:e2e` for auth, organization tenant-isolation, and invitation
  smoke journeys when a migrated PostgreSQL database is available.
- `pnpm test:e2e:db` for deterministic local browser E2E with automatic Docker
  Compose PostgreSQL bootstrap, checked-in migration deployment, isolated
  project/volume cleanup, and fresh app/API processes.
- `pnpm clean:deps`, `pnpm clean:build`, `pnpm upgrade:deps`, `pnpm db:studio`, and `pnpm ui:gen` for maintenance
  workflows.
- `pnpm templates:list`, `pnpm templates:json`, and `pnpm templates:validate` for template track handoff and drift
  checks.
- `pnpm release:check` for the local pre-release ladder matching CI's non-E2E validation contract.
- `pnpm docker:validate` for local production-container build, boot, and
  readiness validation across app, API, and web, including provider fail-fast
  behavior and Next public assets.
- `docs/release-readiness.md` for the final readiness audit, caveats, and template scaffold decision.
