# Exec Plan

## Goal

Make API runtime validation, OpenAPI, and TypeScript clients derive from one
contract without changing accepted HTTP or domain behavior.

## Scope

In scope:

- Contract-first schemas for current API routes.
- oRPC implementations mounted through Hono.
- Generated OpenAPI and browser/server clients.
- Migration of app raw fetch calls.
- Compatibility and contract tests.

Out of scope:

- Domain service refactors, database changes, new endpoints, or query caching.

## Risk Classification

Risk flags:

- Public API contract and authentication boundary.
- Shared package consumed by browser and server runtimes.
- Cross-module migration.

Hard gates:

- Preserve route paths, success statuses, response envelopes, and permissions.
- Keep contract modules free of server-only dependencies.
- Pass API compatibility tests, boundaries, and production builds.

## Work Phases

1. Inventory current routes, consumers, and proof.
2. Define browser-safe contracts and error policy.
3. Implement oRPC routers around existing services.
4. Mount OpenAPI handling and generated specification in Hono.
5. Add typed clients and migrate app consumers.
6. Run focused and release validation; update Harness records.

## Stop Conditions

Pause if a route cannot remain compatible, auth ownership must move, or
validation must be weakened.
