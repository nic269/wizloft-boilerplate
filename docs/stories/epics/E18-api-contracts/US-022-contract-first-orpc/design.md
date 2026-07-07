# Design

## Domain Model

Existing auth, organization, invitation, storage, and jobs packages remain the
business sources of truth. The API package owns transport contracts only.

## Application Flow

1. Hono creates request logging context and serves Better Auth routes.
2. `OpenAPIHandler` matches a route from the shared contract.
3. The oRPC implementation applies session and permission checks and calls the
   existing service package.
4. oRPC validates output before encoding the existing response shape.
5. Browser and server clients call the same contract through `OpenAPILink`.

## Interface Contract

- Existing REST paths and `{ data }` success envelopes remain unchanged.
- Create operations remain `201`; revoke and role update remain `204`.
- Validation errors normalize to status `422` and the existing `{ error }`
  envelope.
- Legacy health RPC URLs remain available and are deprecated in OpenAPI.
- Operation IDs remain stable for existing health endpoints and are explicit
  for all product procedures.

## Data Model

No schema or migration changes.

## UI / Platform Impact

App client components use `@repo/api/client`; they no longer construct API URLs
or duplicate response interfaces. Same-origin Next rewrites continue to carry
session cookies to the API service.

## Observability

Hono request IDs and structured request logs remain the outer service boundary.
Provider delivery errors continue to use the request logger.

## Alternatives Considered

See `docs/decisions/0013-contract-first-orpc-api.md`.
