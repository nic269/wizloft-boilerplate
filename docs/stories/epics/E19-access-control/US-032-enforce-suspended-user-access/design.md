# Design

## Domain Model

`User.status` is the account-level access state. The application boundary only
treats `ACTIVE` users as authenticated.

## Application Flow

`getCurrentSession` keeps using Better Auth as the session parser. After Better
Auth returns a session, the helper verifies that the referenced database user
still exists and has `status = ACTIVE`. If not, it returns `null`.

`hasPermission` also checks `User.status` before honoring super-admin or
membership permissions so lower-level authorization remains safe even if a
caller bypasses `getCurrentSession`.

## Interface Contract

Existing protected API routes continue to return `401 UNAUTHORIZED` when
`getCurrentSession` returns `null`. Protected Next.js server pages continue to
redirect to `/sign-in`.

## Data Model

No schema change. The existing `User.status` enum is used.

## UI / Platform Impact

No new UI. Existing session-guarded app surfaces receive the same unauthenticated
behavior they already use for missing sessions.

## Observability

No audit record is written when access is denied because no product mutation
occurs. Future admin suspension flows should own audit events for the status
change itself.

## Alternatives Considered

1. Check status in every API route and page. Rejected because repeated checks
   are easy to miss.
2. Delete session rows on every suspended-user access attempt. Deferred because
   it adds mutation and concurrency concerns that are not needed for access
   denial.
3. Block only permission checks. Rejected because protected pages that only need
   a session would still render.
