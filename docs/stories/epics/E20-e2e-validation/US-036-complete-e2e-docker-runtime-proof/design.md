# Design

## Domain Model

No product-domain changes.

## Application Flow

The E2E script selects an open port, creates a process-specific Compose project,
force-resets its dedicated schema, runs Playwright, and always removes containers
and volumes. Docker validation builds all runtime targets and probes HTTP assets.

## Interface Contract

Existing routes remain unchanged. `robots.txt` is the deterministic public asset
probe for app and web.

## Data Model

E2E data is ephemeral and isolated per run.

## UI / Platform Impact

Next uses monorepo-root output tracing; Docker copies `public` for app and web.
Browser E2E remains an explicit local release proof.

## Observability

Validation failures include container status/logs and cleanup runs in `finally`.

## Alternatives Considered

1. Promote Playwright to CI immediately. Rejected until a consuming project
   accepts the runtime cost.
