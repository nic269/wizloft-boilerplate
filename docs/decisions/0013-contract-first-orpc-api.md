# 0013 Contract-First oRPC API

Date: 2026-07-07

## Status

Accepted

## Context

The API used a custom health-only RPC registry while organization, invitation,
storage, and jobs routes independently owned validation, response types, and
frontend fetch code. OpenAPI schemas were manually duplicated and could drift
from runtime behavior.

## Decision

Use contract-first oRPC as the API source of truth. Zod contracts own route
metadata, input/output schemas, errors, and operation IDs. oRPC implementations
call existing auth and provider services, `OpenAPIHandler` mounts them in Hono,
`OpenAPIGenerator` publishes the specification, and `OpenAPILink` provides
browser and server clients.

REST paths, auth cookies, success statuses, and the error envelope remain the
runtime interface. The provisional health RPC URLs were removed by decision
0018 because this boilerplate has no production consumers requiring compatibility.

## Alternatives Considered

1. Keep the custom registry and expand it. Rejected because runtime, OpenAPI,
   and client behavior would continue to require parallel implementations.
2. Replace Hono with a standalone oRPC server. Rejected because Hono remains
   the service boundary for Better Auth, request context, logging, and future
   non-oRPC routes.
3. Generate a client from OpenAPI. Rejected because a committed generation step
   adds drift without improving this TypeScript monorepo workflow.

## Consequences

Positive:

- Runtime validation, OpenAPI, and clients share one contract.
- Frontend code no longer manually constructs internal API URLs or response
  types.
- Output validation catches service/contract drift in tests.

Tradeoffs:

- API contracts must stay browser-safe and cannot import server implementations.
- oRPC packages become core API dependencies.
- Historical consumers of the provisional RPC health routes must use
  `/health`, `/ready`, and `/status`.

## Follow-Up

- Add TanStack Query adapters only when a product workflow needs caching,
  invalidation, or optimistic updates beyond current local component state.
