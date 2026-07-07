# Overview

## Status

implemented

## Current Behavior

The API combines independent Hono route validation with a custom health-only
RPC registry. OpenAPI response schemas and frontend response interfaces are
manually duplicated, and product screens call internal routes with raw fetch.

## Target Behavior

Contract-first oRPC schemas drive Hono runtime handling, OpenAPI generation,
and typed browser/server clients for health, organizations, invitations, files,
and jobs. Existing HTTP behavior remains compatible.

## Affected Users

- Product engineers building future generated projects.
- Frontend engineers consuming authenticated product APIs.
- External consumers reading the OpenAPI document.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/ARCHITECTURE.md`
- `docs/decisions/0013-contract-first-orpc-api.md`

## Non-Goals

- Replacing Hono or Better Auth.
- Changing organization, invitation, RBAC, storage, or jobs business logic.
- Adding product-specific endpoints or TanStack Query caching policy.
