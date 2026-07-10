---
date: 2026-07-10
session: US-037 platform hardening
---

# Journal: 2026-07-10 — US-037 Platform Hardening

## Context

US-037 resolved the cross-cutting gaps recorded in `discussion-summary-2.md`.
The work hardened auth delivery, provider readiness, organization integrity,
database identity, pagination, generator validation, and generated-project
behavior while keeping the boilerplate domain-generic.

## What Happened

- Email verification became required, development mail moved to a private JSON
  outbox, and verification safely resumes invitation or dashboard callbacks.
- Startup and `/ready` now apply the same provider requirement policy. Local
  storage reports `local`, and jobs expose truthful async/scoped behavior.
- System roles reconcile from the shared catalog; invitation creation repairs
  legacy organizations and retries the pending-invitation unique race.
- Database invariants now scope job idempotency and enforce partial uniqueness
  for pending invitations and established integration identities.
- Organization lists moved to deterministic opaque cursors, legacy `/rpc/*`
  routes were removed, and the init manifest is runtime-validated with Ajv.
- Independent review found four release blockers. Final fixes added legacy-org
  role repair, consolidated provider evaluation, hardened callback parsing, and
  excluded `.data` outboxes from source and generated Docker contexts.

## Reflection

The implementation stayed runnable across five phases and finished with both
source and generated-project release proof. The independent review was useful:
its blockers were concrete boundary failures, not stylistic objections, and
each resulted in a focused regression test or generated-artifact assertion.
Runtime proof remains intentionally qualified because Harness had no equipped
browser, Docker, or PostgreSQL capability for the final pass.

## Decisions Made

| Decision | Rationale | Impact |
| --- | --- | --- |
| Keep setup-time integration identity nullable; enforce uniqueness only when present | Avoid duplicate scope fields while supporting incomplete setup | Global provider identities cannot collide after assignment |
| Namespace job idempotency with `scopeKey` | Global uniqueness incorrectly coupled independent tenants | Organization and global jobs can reuse logical keys safely |
| Use tracked JSON Schema with Ajv 2020 | Avoid a second schema that can drift | Generator rejects invalid manifests before copying files |
| Auto-sign in after verification and preserve only safe relative callbacks | Keep signup/invitation flow continuous without open redirects | Verification resumes the intended in-app destination |
| Keep development mail as a filesystem outbox, never a public endpoint | Verification and reset links are credentials | E2E can consume mail without exposing secrets over HTTP |
| Omit fake job timeout cancellation | `Promise.race` cannot stop handler side effects | Timeout waits for a future `AbortSignal` contract |
| Reconcile all system roles from one database helper | New and legacy organizations need the same permission catalog | Seed, organization creation, and invitation repair converge |
| Treat local storage as `local`, not durable | Filesystem persistence is deployment-dependent | Readiness and status no longer overstate guarantees |

## Validation

- Source `pnpm release:check`: passed.
- Fresh generated project install and `pnpm release:check`: passed.
- Final auth suite: 46/46 passed; API suite: 30/30 passed.
- Prisma validation and clean forward migration proof passed during the database
  implementation slice; final backfill and indexes received review.
- Mandatory independent review: PASS after all four blockers were fixed.
- Harness browser, Docker, and PostgreSQL capabilities: absent; direct final
  runtime commands clean-skipped per repository policy.

## Next Steps

- Re-run browser E2E, Docker validation, and final PostgreSQL apply when those
  Harness capabilities are equipped.
- Preserve the shared provider evaluator, role reconciler, callback sanitizer,
  and generated Docker-ignore assertions as the extension seams for later work.

## Unresolved Questions

- None blocking completion.
