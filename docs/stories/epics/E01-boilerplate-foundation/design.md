# Design

## Domain Model

Core domain entities are generic: user, session, account, verification, organization, membership, role, role permission,
invitation, audit log, file asset, webhook event, job run, job log, integration connection, and feature flag.

## Application Flow

`apps/app` is the authenticated product app. It rewrites `/api/auth/*` and `/api/*` to `apps/api`.

`apps/api` owns Better Auth, API health, OpenAPI JSON, and generic route slots. Business logic belongs in packages.

## Interface Contract

Initial API routes:

- `GET /status`
- `GET /health`
- `GET /ready`
- `GET /openapi.json`
- `GET|POST /api/auth/*`
- `GET /api/organizations`
- `GET /api/files`
- `GET /api/jobs`

API errors use:

```ts
type ApiErrorResponse = {
	error: {
		code: string;
		message: string;
		details?: unknown;
		requestId?: string;
	};
};
```

## Data Model

The base schema is PostgreSQL via Prisma. It intentionally excludes Shopify, DHL, returns, preorder, import, and
workflow-specific models.

## UI / Platform Impact

The repo has deployable surfaces for app, web, API, docs, email preview, and storybook. Each app owns its env contract.

## Observability

The API emits structured request logs with request id, route, duration, and status code. Audit logs are product records,
not operational logs.

## Alternatives Considered

1. Single Next app with API routes.
2. Directly copying Ops Hub app code.
3. Delaying optional packages until first project.
