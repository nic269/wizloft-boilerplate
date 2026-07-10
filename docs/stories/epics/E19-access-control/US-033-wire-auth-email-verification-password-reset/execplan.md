# Exec Plan

## Goal

Make Better Auth password-reset and email-verification delivery ready for real
projects by wiring the callbacks to the shared mail provider and templates.

## Scope

In scope:

- Add testable Better Auth option construction.
- Configure `sendResetPassword`.
- Configure `sendVerificationEmail` and `sendOnSignUp`.
- Allow server-side `@repo/auth` to import `@repo/mail`.
- Update product, release, plan, story, and Harness records.

Out of scope:

- Requiring verified email before sign-in.
- Adding forgot-password or reset-password app pages.
- Changing provider fail-fast or Resend validation behavior.

## Risk Classification

Risk flags:

- Auth.
- Audit/security.
- External systems.
- Existing behavior.
- Weak proof.

Hard gates:

- Auth.
- External provider behavior.

## Work Phases

1. Discover Better Auth local callback names and types.
2. Create Harness intake and high-risk story packet.
3. Refactor auth config into a testable options factory.
4. Wire reset and verification callbacks to `@repo/mail`.
5. Add focused unit tests for callback delivery.
6. Run focused validation and release ladder.
7. Update docs and Harness trace.

## Stop Conditions

Pause for human confirmation if:

- Email verification must become mandatory before sign-in.
- New app pages are needed to complete the accepted scope.
- Better Auth option names differ from the installed package types.
- Boundary validation shows a package layering issue that requires a different
  architecture.
