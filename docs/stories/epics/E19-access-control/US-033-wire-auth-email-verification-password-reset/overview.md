# Overview

## Current Behavior

Better Auth email/password sign-up and sign-in work, and the repository already
has shared React Email templates for verification and password reset. The Better
Auth server config does not yet wire those templates into `sendVerificationEmail`
or `sendResetPassword`, so reset and verification delivery are not ready for a
real fork.

## Target Behavior

Better Auth emits verification and password-reset emails through `@repo/mail`
using the shared templates. Sign-up sends a verification email by default, and
password-reset requests have a configured delivery callback. Existing sign-up
auto sign-in behavior remains unchanged in this story.

## Affected Users

- App users who sign up and need an email verification link.
- App users who request a password reset.
- Operators configuring local console mail or Resend delivery.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`
- `plans/2026-07-09-boilerplate-ready-to-use-hardening/phase-02-auth-and-authorization-safety.md`

## Non-Goals

- Do not require verified email before sign-in in this story.
- Do not add browser forgot-password or reset-password forms in this story.
- Do not change provider fail-fast behavior; that belongs to Phase 03.
