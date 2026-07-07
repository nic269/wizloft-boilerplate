# Organization Permission Catalog

Date: 2026-07-05

## Status

Superseded by `0014-central-access-control-policy.md` for package ownership.
The permission vocabulary and authorization behavior remain accepted.

## Context

Role management needs a safe default permission surface. Free-form permissions would let API callers persist arbitrary
module/action pairs that no code understands, making access reviews and future templates harder to reason about.

## Decision

The auth package owns a small permission catalog for organization, member, role, and audit actions. Role creation accepts
only catalog permissions. The Owner role receives the full catalog for newly created organizations. Member remains
read-oriented by default.

## Alternatives Considered

1. Free-form permissions.
2. Hard-code permissions only in API routes.

## Consequences

Positive:

- Role APIs have a durable whitelist.
- Owner provisioning and API authorization use the same vocabulary.
- Future app templates can extend the catalog intentionally.

Tradeoffs:

- Adding new modules requires code changes.
- Existing local databases may need re-seeding or a future backfill if they contain Owner roles created before this
  decision.

## Follow-Up

- Add role editing and owner self-demotion rules when a product needs them.
