# Boilerplate Platform Product Contract

## Goal

Provide a reusable, production-ready SaaS monorepo foundation that can start future apps without carrying any Ops Hub
domain assumptions.

## Core Behaviors

- Multi-app monorepo with independent deployable surfaces.
- Better Auth server/client package split.
- Same-origin auth/API rewrites from `apps/app` to `apps/api`.
- Generic Prisma schema for auth, organizations, RBAC, invitations, audit, files, webhooks, jobs, integrations, and flags.
- Optional mail, storage, jobs, billing, analytics, CMS, and observability packages that degrade gracefully.
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
