# Auth Recovery and API Error Consistency

Date: 2026-07-10

## Status

Accepted

## Context

The boilerplate already wired Better Auth delivery callbacks for password reset
and email verification, but the product app did not expose browser screens to
request or consume those links. API errors also had two inconsistent edges:
oRPC error bodies lacked `requestId`, and organization invitation revocation
collapsed all domain invitation errors to `INVITATION_NOT_FOUND`.

## Decision

Add product-app recovery screens that call the Better Auth client directly:
`/forgot-password`, `/reset-password`, and `/verify-email`. Keep Better Auth's
same-origin `/api/auth/*` route as the auth interface and do not add a duplicate
Hono contract for recovery actions.

API error responses must include `requestId` in Hono and oRPC error envelopes.
Invitation revoke routes must preserve the `InvitationError` code and map it to
the status already declared by the API contract.

Intentional `ApiError` messages and details remain client-visible. Unexpected
exceptions keep their diagnostic message and stack in server logs, but clients
receive only a generic `INTERNAL_SERVER_ERROR` message with the request ID.

Owner protection must target the seeded system Owner role, using `Role.isSystem`
with the Owner role name, so a custom role named Owner does not accidentally
become the protected invariant.

## Alternatives Considered

1. Add custom Hono recovery endpoints. Rejected because Better Auth already owns
   token issuance, verification, and reset semantics.
2. Keep request IDs only in headers. Rejected because API clients and logs need
   the same correlation ID in the documented JSON error body.
3. Protect any role named Owner. Rejected because only seeded system roles carry
   the boilerplate invariant.

## Consequences

Positive:

- Real forks can use reset and verification links without adding first-run auth
  UI plumbing.
- API clients receive consistent error correlation data across Hono and oRPC
  paths.
- Unexpected database, provider, filesystem, or service diagnostics are not
  disclosed to API clients.
- Invitation revoke clients can distinguish not-found from not-pending states.
- Custom roles cannot accidentally inherit the system Owner invariant by name.

Tradeoffs:

- Decision 0016 supersedes the original optional-verification tradeoff: verified
  email is now required before authenticated product access.

## Follow-Up

- Browser E2E now consumes the private development outbox for verification links.
