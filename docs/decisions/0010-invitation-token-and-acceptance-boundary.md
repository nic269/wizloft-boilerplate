# 0010 Invitation Token and Acceptance Boundary

Date: 2026-07-05

## Status

Accepted

## Context

Invitations cross tenant, authentication, email delivery, and durable membership boundaries. The base scaffold does not
yet provide mandatory email verification delivery.

## Decision

Generate cryptographically random invitation tokens, persist only SHA-256 hashes, and require a valid Better Auth
session whose normalized email exactly matches the invitation. Create, revoke, and accept transitions are permissioned
or identity-bound and write audit records. Invitations receive the default Member role. Email verification is not yet
required for acceptance and must be added with a functioning verification-delivery story rather than a non-runnable
flag.

## Alternatives Considered

1. Store plaintext tokens for administrative recovery. Rejected due to credential exposure.
2. Accept by token without a session. Rejected because membership must bind to a known user.
3. Require `emailVerified` now. Rejected because no verification sender or UI exists, making invitations unusable.

## Consequences

Positive:

- Database records do not contain reusable invitation credentials.
- A token cannot add a different signed-in email to the organization.
- Lifecycle changes are auditable and tenant-scoped.

Tradeoffs:

- Account-email ownership inherits the current email/password signup posture until verification is implemented.
- The API owns organization invitations instead of delegating to a Better Auth plugin.

## Follow-Up

- Implement email verification delivery and require verified email before invitation acceptance.
