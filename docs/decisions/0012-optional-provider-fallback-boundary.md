# Optional Provider Fallback Boundary

Date: 2026-07-05

## Status

Accepted

## Context

The boilerplate includes optional mail, storage, and jobs integrations. These must be useful locally without secrets but
must also make missing cloud credentials visible so production deployments do not accidentally look configured.

## Decision

Provider packages expose status helpers with a `configured` flag. Missing
optional credentials must not crash local development. Local/dev fallbacks are
allowed only when they are explicit and private: filesystem-outbox mail, local
object storage, memory storage, and in-process jobs. Local filesystem storage is
reported as local rather than durable. S3/R2 storage remains private and uses
server-side encryption for writes and signed URLs.

Feature requirements refine this boundary: email verification, password reset,
and organization invitations make a real mail provider required in production.
Startup and `/ready` evaluate that same requirement while development continues
to use the private outbox.

## Alternatives Considered

1. Throw on missing optional provider env in every environment. Rejected
   because it breaks first-run local development.
2. Silently pretend cloud providers are configured. Rejected because it hides deployment risk.

## Consequences

Positive:

- Local development stays runnable.
- Provider readiness is inspectable from code and API status routes.
- Future product workflows can depend on package contracts instead of ad hoc env checks.

Tradeoffs:

- Local job runs are not durable across restarts.
- Live provider smoke tests remain a deployment concern.
- Production auth-enabled forks must configure real mail before becoming ready.

## Follow-Up

- Add durable database-backed jobs when a product needs cross-process execution.
- Add authorized file upload/download routes when a product story needs user-facing files.
