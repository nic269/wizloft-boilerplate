# Boilerplate Ready-To-Use Hardening Plan

## Status

Started: 2026-07-09

This plan turns `discussion-summary.md` into manageable implementation slices.
The goal is to move the boilerplate from "ready with caveats" to "ready to fork
and operate with fewer sharp edges" without adding speculative product-domain
code.

## Source Inputs

- `discussion-summary.md`
- `docs/product/boilerplate-platform.md`
- `docs/release-readiness.md`
- `scripts/bin/harness-cli query matrix`

## Principles

- Keep the boilerplate core domain-generic.
- Preserve generated project cleanliness.
- Prefer small vertical hardening stories over one large readiness rewrite.
- Treat auth, authorization, data model, provider runtime behavior, and public
  API changes as high-risk story candidates.
- Keep every phase runnable through the release ladder before continuing.
- Update product docs, release readiness, story packets, and Harness evidence as
  each slice lands.

## Current Baseline

| Area | Status | Evidence |
| --- | --- | --- |
| Project generator consistency | Done | `US-029`; generator/boundary tests, `pnpm check:ci`, `pnpm check-types`, `pnpm boundaries`, `pnpm release:check`. |
| API readiness signal | Done | `US-030`; `/ready` checks database and returns 503 when not ready; API tests and release ladder passed. |
| Organization owner invariant | Done | `US-031`; role updates cannot demote the final active Owner; auth/API tests and release ladder passed. |
| Suspended-user access invariant | Done | `US-032`; shared session and permission helpers deny non-active users; auth/API tests and release ladder passed. |
| Release contract docs | In progress | `docs/product/boilerplate-platform.md` and `docs/release-readiness.md` have been updated by completed slices. |

## Phases

### Phase 01: Generation And API Readiness

Status: done.

Completed stories:

- `US-029` Generated project consistency hardening.
- `US-030` Real API readiness.

Exit criteria:

- Generated projects do not carry source-only template catalog code.
- Generated feature flags match selected app surfaces.
- Generated ignore files are review-friendly.
- API `/health` and `/ready` have separate semantics.
- `pnpm release:check` passes.

### Phase 02: Auth And Authorization Safety

Status: in progress.

Candidate stories:

- Last-owner and system-role protection. Implemented as `US-031`.
- Enforce `UserStatus.SUSPENDED` across session/API access. Implemented as
  `US-032`.
- Better Auth verification and password-reset flow hardening.

Risk lane:

- High-risk by default because these touch auth, authorization, sessions,
  existing behavior, and user-visible access semantics.

Validation:

- Focused auth service tests.
- API contract/router tests for denied access.
- Playwright E2E when the behavior is browser-visible.
- `pnpm check:ci`
- `pnpm check-types`
- `pnpm boundaries`
- `pnpm release:check`

Pause points:

- Confirm expected owner lockout behavior before implementation if the current
  product contract is ambiguous.
- Confirm whether suspended users should be blocked at session creation,
  protected page access, API access, or all of these.

### Phase 03: Provider Runtime Fail-Fast And Diagnostics

Status: planned.

Candidate stories:

- Production fail-fast for partially configured S3/R2 storage.
- Production fail-fast for partially configured Resend or SMTP mail.
- Provider status diagnostics that distinguish disabled, configured, and broken
  provider states.

Risk lane:

- High-risk by default because external provider behavior and runtime startup
  semantics affect deployment safety.

Validation:

- Provider env contract tests.
- API provider status tests.
- Production-like env smoke for each fail-fast case.
- `pnpm release:check`
- `pnpm docker:validate` when runtime startup behavior changes.

### Phase 04: Database Integrity Hardening

Status: planned.

Candidate stories:

- Add missing indexes and uniqueness constraints where query patterns and domain
  invariants need them.
- Make `FeatureFlag` globally unique only if the product contract confirms that
  flags are global.
- Reconcile invitation role relations with the accepted RBAC model.
- Reconcile seed data with the access-control catalog.

Risk lane:

- High-risk by default because schema, migrations, uniqueness, and seed behavior
  affect stored data and generated projects.

Validation:

- Prisma validate/generate.
- Database service tests against PostgreSQL where uniqueness is behaviorally
  relevant.
- Seed idempotency tests or smoke.
- `pnpm test:e2e:db` if auth/org flows are affected.
- `pnpm release:check`

Pause points:

- Confirm global vs organization-scoped feature flags before changing schema.
- Confirm whether invitation role should be a relation, immutable snapshot, or
  both.

### Phase 05: E2E And Docker Runtime Completeness

Status: planned.

Candidate stories:

- Improve deterministic E2E database lifecycle if repeated flake or lifecycle
  drift appears.
- Validate Docker public assets and Next output tracing roots.
- Promote browser E2E into CI only if runtime budget allows it.

Risk lane:

- Normal unless runtime contracts or deployment image behavior changes broadly.

Validation:

- `pnpm test:e2e:db`
- `pnpm docker:validate`
- `pnpm release:check`

## Story Creation Rules

- Use `docs/templates/high-risk-story/` for auth, authorization, data model,
  provider runtime behavior, or public contract changes.
- Use `docs/templates/story.md` for bounded validation, generator, tooling, or
  documentation hardening.
- Create one story per vertical invariant. Do not combine auth, provider, and
  schema work into a single implementation story.
- Each story must name affected docs, source files, acceptance criteria,
  validation commands, and pause points.

## Management Workflow

1. Pick the next phase and smallest candidate story.
2. Record Harness intake for that story.
3. Create or update the story packet.
4. Implement the slice.
5. Run focused validation first, then the release ladder.
6. Update product docs and release readiness caveats.
7. Update Harness story evidence and trace.
8. Return to this plan and mark the next candidate.

## Next Recommended Slice

Start Phase 02 with last-owner and system-role protection. It is the highest
severity remaining gap because it protects organization ownership and
authorization invariants before provider or schema polish.

## Open Questions

- Should suspended users be blocked from all API access even if an existing
  Better Auth session remains valid?
- Should feature flags be global, organization-scoped, or support both models?
- Should production fail-fast apply only when a provider is explicitly selected,
  or also when partial credentials are present?
