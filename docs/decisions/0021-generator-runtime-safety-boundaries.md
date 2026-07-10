# Generator and Runtime Safety Boundaries

Date: 2026-07-10

## Status

Accepted

## Context

The generator can copy into a descendant of its own source tree, unexpected Hono exceptions can expose internal messages, caller-controlled mail headers are not centrally validated, and optional runtime/config labels imply stronger production guarantees than the base boilerplate provides.

## Decision

Generator source and target trees must be disjoint: equality and either ancestry direction are rejected before target creation. Checks use canonical filesystem ancestry, including existing symlinked parents, rather than lexical paths alone. Intentional `ApiError` values remain client-visible, but every unexpected Hono or oRPC exception returns a generic 500 envelope while full diagnostics stay in server logs. The mail boundary rejects CR/LF in caller-provided subject, recipient, and sender fields before choosing a provider, and every exported provider send path enforces the same invariant.

The base boilerplate does not mark jobs as an enabled required feature until a product selects a durable adapter or explicitly accepts an ephemeral workflow. The bundled local provider remains useful for development and reports an ephemeral mode. Organizations remain unconditional core behavior, so no unused organization feature flag is exposed. `appSurfaces` describes workspace surfaces; it does not promise that every entry is a production runtime.

## Alternatives Considered

1. Permit nested generator targets and rely on copy implementation behavior. Rejected because self-copy behavior is unsafe and platform-dependent.
2. Return unknown exception messages for diagnostics. Rejected because request IDs and server logs provide correlation without disclosing internals.
3. Validate mail headers only in current callers. Rejected because future callers could bypass the invariant.
4. Add durable jobs infrastructure now. Deferred until a real product selects execution, retry, locking, and scaling requirements.
5. Add runtime/tooling metadata to app surfaces for one label. Deferred because neutral workspace wording is accurate with less contract churn.

## Consequences

Positive:

- Generator source files cannot be recursively copied into themselves.
- Symlinked target parents cannot bypass generator ancestry checks.
- API clients do not receive provider, database, filesystem, or service diagnostics from unexpected failures.
- Header injection is rejected consistently across direct console, SMTP, and
  Resend delivery paths.
- Readiness and UI wording no longer overstate optional capabilities.

Tradeoffs:

- Invalid CR/LF-bearing mail headers now fail instead of being forwarded.
- Projects requiring production jobs must add or select a durable provider and explicitly enable the requirement.

## Follow-Up

- Add a durable jobs adapter only when a concrete product can validate its delivery and scaling semantics.
