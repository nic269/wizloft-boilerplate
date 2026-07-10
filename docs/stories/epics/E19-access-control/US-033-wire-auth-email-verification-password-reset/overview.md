# Overview

## Current Behavior

Better Auth email/password sign-up and sign-in work, and the repository already
has shared React Email templates for verification and password reset. Earlier
hardening wired server delivery callbacks, but the browser app still needed
forgot-password, reset-password, verify-email, and resend screens for a real
fork to exercise those callbacks end to end.

## Target Behavior

Better Auth emits verification and password-reset emails through `@repo/mail`
using the shared templates. Sign-up sends a verification email by default,
password-reset requests have a configured delivery callback, and the app exposes
browser screens for requesting reset links, setting a new password, verifying an
email token, and resending a verification email. Existing sign-up auto sign-in
behavior remains unchanged in this story.

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
- Do not change provider fail-fast behavior; that belongs to Phase 03.
