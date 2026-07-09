# Overview

## Current Behavior

`User.status` includes `ACTIVE`, `INVITED`, and `SUSPENDED`, but shared session
and permission helpers do not enforce it. A suspended user with an existing
Better Auth session can still appear authenticated to API routes and protected
server-rendered pages.

## Target Behavior

Only `ACTIVE` users are treated as authenticated by the boilerplate application
boundary. Suspended, invited, or missing users resolve to no current session and
cannot pass permission checks.

## Affected Users

- Administrators and future projects that need account suspension semantics.
- Suspended end users attempting to access protected app or API surfaces.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`
- `plans/2026-07-09-boilerplate-ready-to-use-hardening/phase-02-auth-and-authorization-safety.md`

## Non-Goals

- Admin UI to suspend or reactivate users.
- Better Auth sign-in form customization.
- Session revocation job or deletion of existing session records.
- Email verification and password reset hardening.
