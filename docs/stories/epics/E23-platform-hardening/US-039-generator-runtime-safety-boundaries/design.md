# Design

## Domain Model

- Generator source and target trees must be disjoint.
- `ApiError` represents deliberate client-visible failures; all other exceptions are internal.
- Mail `subject`, `to`, and `from` are header values and cannot contain CR/LF.
- The local jobs provider is in-process and ephemeral, not a production durability claim.
- Organizations are foundational behavior; `appSurfaces` enumerate workspace surfaces, not deployment guarantees.

## Application Flow

- Canonicalize source and prospective target paths, including the nearest
  existing target ancestor, before creating or copying files; then reject
  equality and either ancestry direction.
- Log an unexpected Hono or oRPC exception with a stable event and diagnostic
  fields, then return a generic 500 envelope with the request ID.
- Validate mail headers before selecting or invoking any provider and wrap
  every exported provider send path with the same check.
- Keep the local jobs implementation available for development while marking the base jobs feature as not required.

## Interface Contract

- Intentional `ApiError` status, code, message, details, and request ID remain unchanged.
- Unexpected errors return `INTERNAL_SERVER_ERROR` and `An unexpected error occurred.` without details.
- Invalid mail headers fail before delivery.
- Job diagnostics describe the local mode as ephemeral.

## Data Model

No schema or migration changes.

## UI / Platform Impact

- `pnpm boilerplate:init` fails fast for unsafe target topology.
- Marketing labels every configured app entry as a workspace surface.

## Observability

- Unknown failures log `api.unhandled_error` with the original error message and stack.
- Client error responses retain request ID correlation without internal diagnostics.

## Alternatives Considered

1. Only set `featureConfig.jobs` to false while retaining optimistic provider wording. Rejected because diagnostics should also disclose ephemerality.
2. Add runtime/tooling metadata to every app surface. Deferred because a copy-only correction solves the current misleading claim without expanding generator contracts.
3. Sanitize every mail caller independently. Rejected because the provider boundary must enforce the invariant for future callers.
