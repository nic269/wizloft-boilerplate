# Overview

## Current Behavior

The project generator accepts a target nested under its source tree, unknown Hono errors expose exception messages, mail headers rely on caller-specific sanitization, and configuration/status wording overstates optional jobs and deployability.

## Target Behavior

Filesystem and mail boundaries reject unsafe input, unexpected API failures are sanitized for clients while retaining server diagnostics, and configuration/readiness/UI wording accurately describes core organizations, ephemeral local jobs, and workspace surfaces.

## Affected Users

- Developers generating new projects.
- API clients and operators.
- Developers integrating mail and jobs providers.
- Maintainers using the marketing handoff surface.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`
- `docs/decisions/0012-optional-provider-fallback-boundary.md`
- `docs/decisions/0015-auth-recovery-and-api-error-consistency.md`

## Non-Goals

- Building a durable or distributed jobs adapter.
- Adding a single-tenant mode or organization feature switch.
- Replacing intentional `ApiError` messages with generic errors.
- Introducing app-surface metadata solely for marketing copy.

