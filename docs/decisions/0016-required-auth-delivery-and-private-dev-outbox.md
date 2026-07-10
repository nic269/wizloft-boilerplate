# 0016 Required Auth Delivery and Private Dev Outbox

Date: 2026-07-10

## Status

Accepted

## Context

Verification, password reset, and invitations depend on email, but production
could start with console delivery and verification was not enforced.

## Decision

Email/password accounts require verification. Enabled auth delivery features
make a configured mail provider mandatory in production. Development console
delivery persists text content to a private filesystem outbox and never exposes
tokens through a public endpoint. Successful verification resumes a safe
callback with automatic sign-in.

## Alternatives Considered

1. Optional verification leaves the existing UX claim unenforced.
2. A public development inbox risks leaking credential-bearing links.
3. Requiring explicit sign-in after verification adds friction to invitation flow.

## Consequences

Positive:

- Auth email ownership becomes an enforced product invariant.
- Local and E2E delivery remains observable without real credentials.

Tradeoffs:

- Production startup/readiness requires real mail configuration.
- Existing signup E2E must verify before entering the app.

## Follow-Up

- Add provider-specific delivery smoke when deployment credentials exist.
