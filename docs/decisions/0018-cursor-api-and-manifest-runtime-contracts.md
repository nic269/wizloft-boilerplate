# 0018 Cursor API and Manifest Runtime Contracts

Date: 2026-07-10

## Status

Accepted

## Context

List endpoints returned unbounded arrays, deprecated RPC routes expanded the API
surface without consumers, and the init manifest JSON Schema was not enforced at
runtime.

## Decision

Organization lists use deterministic opaque cursor pagination while retaining a
`data` array and adding `pageInfo.nextCursor`. Deprecated RPC health routes are
removed. Ajv 2020 validates init manifests directly against the tracked JSON
Schema before generation.

## Alternatives Considered

1. Offset pagination is less stable under concurrent inserts.
2. Keeping deprecated RPC adds maintenance without compatibility value.
3. A second runtime schema can drift from the published JSON Schema.

## Consequences

Positive:

- List contracts scale predictably and generator errors become actionable.
- API and schema sources of truth are smaller and clearer.

Tradeoffs:

- Existing in-repo list callers must migrate atomically.

## Follow-Up

- Apply the pagination primitive to future list endpoints from their first release.
