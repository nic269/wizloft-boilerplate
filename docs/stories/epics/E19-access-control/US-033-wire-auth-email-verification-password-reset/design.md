# Design

> Superseded in part by decision 0016 and US-037: verification is now required
> and E2E consumes a private development outbox.

## Domain Model

The story uses Better Auth's existing `User`, verification token, and reset
token behavior. The boilerplate-owned invariant is delivery: when Better Auth
generates a verification or reset URL, the configured callback must hand it to
the shared mail provider and template surface.

## Application Flow

1. Better Auth creates a sign-up verification token when configured to send on
   sign-up.
2. Better Auth invokes `emailVerification.sendVerificationEmail`.
3. `@repo/auth` renders `VerificationEmail` from `@repo/mail` and sends it
   through `sendMail`.
4. Better Auth creates a password-reset token when the reset endpoint is used.
5. Better Auth invokes `emailAndPassword.sendResetPassword`.
6. `@repo/auth` renders `PasswordResetEmail` from `@repo/mail` and sends it
   through `sendMail`.
7. `/forgot-password` posts to Better Auth `requestPasswordReset`.
8. `/reset-password?token=...` posts the new password and token to Better Auth
   `resetPassword`.
9. `/verify-email?token=...` verifies the token through Better Auth
   `verifyEmail`; `/verify-email` without a token sends a new verification email
   for the submitted address.

## Interface Contract

The Better Auth same-origin `/api/auth/*` route remains the public interface.
The browser app uses `@repo/auth/client`; no new Hono API contract is added.

## Data Model

No schema changes. Better Auth already owns the `Verification` model and user
`emailVerified` field.

## UI / Platform Impact

The authenticated app adds compact auth recovery screens under the existing
auth route group. Local development uses console mail when provider credentials
are absent. Production delivery uses the existing `@repo/mail` provider
selection.

## Observability

Mail delivery keeps using the existing provider behavior. Console delivery logs
`mail.console` through `@repo/logger`.

## Alternatives Considered

1. Require email verification before sign-in immediately. Rejected for this
   story because it changes the current onboarding UX and existing browser E2E
   flow. That should be a separate story with app UI changes.
2. Send emails directly from app/API surfaces. Rejected because `@repo/mail`
   already owns provider selection and reusable templates.
