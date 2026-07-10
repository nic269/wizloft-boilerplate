# Phase 02: Auth And Authorization Safety

## Status

Completed through `US-031`, `US-032`, and `US-033`.

## Goal

Harden account, session, membership, and role invariants so the generated
boilerplate starts from safe defaults before real projects add domain logic.

## Candidate Stories

- Last-owner and system-role protection. Implemented as `US-031`.
- `UserStatus.SUSPENDED` enforcement across session, protected pages, and API
  access. Implemented as `US-032`.
- Better Auth verification and password-reset flow hardening. Implemented as
  `US-033`.

## Risk

High-risk. This phase touches auth, authorization, sessions, roles, existing
behavior, and user-visible access semantics.

## Files To Inspect First

- `packages/auth/src/**`
- `packages/access-control/src/**`
- `packages/api/src/routers/**`
- `apps/app/src/**`
- `packages/database/prisma/schema.prisma`
- Existing auth and API tests.

## Validation

- Focused auth service tests.
- Focused API router tests.
- Browser E2E when the access behavior is user-visible.
- `pnpm check:ci`
- `pnpm check-types`
- `pnpm boundaries`
- `pnpm release:check`

## Pause Points

- Confirm whether suspended users should be blocked at session creation, all
  protected page access, all API access, or all of these.
- Confirm whether the last owner can transfer ownership in the same operation
  that removes their owner role.
- Confirm which roles are system roles and whether projects may rename them.
