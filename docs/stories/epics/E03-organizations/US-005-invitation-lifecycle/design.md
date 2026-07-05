# US-005 Design

## Domain Model

Invitations transition from `PENDING` to `ACCEPTED`, `REVOKED`, or effectively expired when `expiresAt` passes. Each
invitation carries a hashed random token and a default Member role. Only pending invitations can be revoked or accepted.

## Application Flow

- Create: validate permission, normalize email, issue or refresh a pending invitation, audit, then deliver the URL.
- Revoke: validate permission, conditionally transition a pending invitation, and audit in one transaction.
- Accept: validate session email, token, status, and expiry; upsert active membership; transition invitation; audit.

## Interface Contract

- `GET /api/organizations/:organizationId/invitations`
- `POST /api/organizations/:organizationId/invitations` with `{ email }`
- `DELETE /api/organizations/:organizationId/invitations/:invitationId`
- `POST /api/invitations/accept` with `{ token }`

Errors use the standard API envelope with 401, 403, 404, 409, 410, or 422 status as appropriate.

## Data Model

The existing Invitation and Membership models are sufficient. A per-organization Member role is upserted lazily so
organizations created before this story remain compatible. No migration is required.

## UI / Platform Impact

`/settings/members` provides invitation management. `/invite/:token` handles acceptance. Auth pages preserve a validated
same-origin callback URL so users can sign in or sign up and return to the invitation.

## Observability

`invitation.created`, `invitation.revoked`, and `invitation.accepted` audit actions record actor, organization, target,
and non-secret metadata. Mail delivery logs provider and recipient without logging the token. Acceptance links use the
validated `NEXT_PUBLIC_APP_URL`; request headers cannot choose the link host.

## Alternatives Considered

1. Persist plaintext invitation tokens. Rejected because database access would grant invitation access.
2. Require verified email immediately. Deferred because the scaffold has no configured verification delivery flow;
   authenticated exact-email matching is enforced until that capability is added.
3. Use the Better Auth organization plugin. Deferred under decision 0009 to preserve the generic Prisma RBAC contract.
