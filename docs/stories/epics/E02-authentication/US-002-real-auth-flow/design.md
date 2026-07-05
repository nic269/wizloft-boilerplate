# Design

## Domain Model

The story uses the existing Better Auth `User`, `Session`, `Account`, and `Verification` models. A user is authenticated
when Better Auth returns a session with a user.

## Application Flow

Sign-up:

1. Visitor submits name, email, and password.
2. Client calls `authClient.signUp.email`.
3. Better Auth creates the user/account/session and returns a session cookie.
4. App navigates to `/dashboard`.

Sign-in:

1. Visitor submits email and password.
2. Client calls `authClient.signIn.email`.
3. App navigates to `/dashboard` when successful.

Sign-out:

1. Authenticated user clicks sign out.
2. Client calls `authClient.signOut`.
3. App navigates to `/sign-in`.

## Interface Contract

- `GET /sign-in` renders the sign-in form.
- `GET /sign-up` renders the account creation form.
- `GET /dashboard` requires a Better Auth session.
- `POST /api/auth/*` remains served by the Hono API through same-origin Next rewrites.

## Data Model

No schema changes are planned. The flow uses existing Better Auth tables and PostgreSQL.

## UI / Platform Impact

The app adds client form components for auth pages and a session-aware dashboard topbar. Mobile and desktop layouts use
the existing design-system primitives.

## Observability

The Hono request context continues to emit API request logs. Product audit logging is deferred to the organization/RBAC
stories.

## Alternatives Considered

1. Next server actions directly calling `auth.api`: deferred because the app/API split already uses Hono and same-origin
   rewrites.
2. Full organization onboarding on sign-up: deferred to keep this story focused on authentication.
