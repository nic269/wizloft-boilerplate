# Boilerplate Platform Product Contract

## Goal

Provide a reusable, production-ready SaaS monorepo foundation that can start future apps without carrying any Ops Hub
domain assumptions.

## Core Behaviors

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
- Generic design-system and helper packages.

## Non-Goals

- DHL, Evisu, preorder, return, import executor, Shopify workflow, brand asset, secret, or store-specific code in core.
- A complete LMS, dev-tools, or Shopify app domain implementation in the base scaffold.

## Validation

- `pnpm install`
- `pnpm check`
- `pnpm check-types`
- `pnpm dev`
- `pnpm boundaries`
- `pnpm test:e2e` for the auth smoke when a migrated PostgreSQL database is available.
