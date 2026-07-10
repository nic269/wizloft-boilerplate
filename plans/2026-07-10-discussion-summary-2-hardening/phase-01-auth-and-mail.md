---
status: completed
---

# Phase 01: Auth and Mail

## Completion

- [x] Require verification and preserve safe callback flow.
- [x] Derive auth mail branding from shared config.
- [x] Add private filesystem outbox and production mail requirement.
- [x] Deny crawler indexing for the authenticated app.
- [x] Add focused auth, mail, callback, and outbox tests.

## Requirements

- Require email verification for email/password accounts.
- Auto-sign in after successful verification and preserve safe callback URLs.
- Derive auth email branding from `@repo/config`.
- Make production mail required when auth delivery features are enabled.
- Persist console mail to a private development outbox.
- Disallow crawler indexing for the authenticated app.

## Files

- `packages/config/src/features.ts`
- `packages/auth/src/auth-options.ts`
- `packages/auth/src/session.ts`
- `packages/mail/src/*`
- `apps/app/app/(auth)/*`
- `apps/app/app/layout.tsx`
- `apps/app/public/robots.txt`
- Related tests and environment contracts.

## Validation

- Auth, mail, app and E2E tests.
- Production provider-policy tests.

## Risks

- Signup and invitation journeys must obtain verification links from the
  outbox before continuing.
