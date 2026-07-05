# Overview

## Current Behavior

The app has Better Auth packages, API rewrites, and static sign-in/sign-up pages. The forms do not submit to Better Auth,
the dashboard does not read the current session, and the route guard only checks one cookie name.

## Target Behavior

Users can create an email/password account, sign in, land on the authenticated dashboard, see their current session
identity, and sign out. Protected app routes redirect unauthenticated users to `/sign-in`.

## Affected Users

- Visitor creating an account.
- Authenticated user using the app shell.
- Developer using the boilerplate as a starter.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`

## Non-Goals

- Organization onboarding.
- Invite acceptance.
- OAuth setup beyond the existing optional Google provider boundary.
- Password reset and email verification UX.
