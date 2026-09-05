# Validation Matrix

Date: 2026-09-05
Status: **COMPLETED — ALL PROOF EXECUTED AND RECORDED**
Scope: [plan](plan.md). All layers run against final source state; actual commands/versions/results in reports/pm-2026-09-05-meldmark-feedback-completion.md and phase files.

## Executed summary (per contract)
- Source release:check green (template validation, formatting, typecheck, unit tests, boundaries, build).
- Installed full profile matrix 32/32 (Node 24.20.0, pnpm 11.23.0).
- Focused: 71 passing + interruption-cleanup.
- Source PostgreSQL/E2E: 5 integration + 16 browser passing without a source `.env`.
- Generated core-minimal PostgreSQL/E2E: 1 identity int + 12 browser passing.
- 6 representative runtimes: release/E2E/Docker evidence.
- Maximal docs: booted + API docs (env prop fixed).
- Docker redundant retries: npm registry timeouts only (no source defect).
- Serializable real conflict + owner race + unit bounded proof.
- SaaS migration bytes unchanged.
- Final reviewer: all prior gaps resolved.
## Layers and command ownership
## Per-phase required proof (executed)

| Phase | Additional to focused/source release |
| --- | --- |
| 01 / BP-01 | Real adapter serialization/deadlock conflicts + Owner race + 3-attempt; generated SaaS smoke; source PostgreSQL/E2E 5+16. |
| 02 / BP-02 | Positive/negative import fixtures + CLI rejection; generated boundary + release; part of 32/32. |
| 03 / BP-03 | Copy fixtures + ignores; migration status states; E2E env override + health + interrupt cleanup (71+test); 6 runtimes Docker/E2E; env fix. |
| 04 / BP-05 | Git/dirty/directory receipt cases + digest; gen skip/install modes + release independent; 32/32. |
| 05 / BP-04 | Full 32 matrix; core-min identity 1+12 + source 5+16; SaaS bytes same; maximal docs boot. |


## Profile and app matrix (executed for 32/32)


After BP-04 there are exactly 32 selected configurations: each of saas/core with required app/API plus every subset of web/docs/email/Storybook.

| Matrix | Required proof |
| --- | --- |
| All 32 sets | Fresh generation, install, dependency/export/policy closure, receipt selection, lint, typecheck, boundaries, production build. Empty directories or file existence do not substitute for installed proof. |
| Both profiles × minimal `app,api` | Full generated release, fresh migration/integration, desktop/mobile E2E, app/API container smoke. |
| Both profiles × standard `app,api,web,email,storybook` | Full generated release, fresh migration/integration, desktop/mobile E2E, app/API/web container smoke, email/Storybook build. |
| Both profiles × maximal `app,api,web,docs,email,storybook` | Full generated release, fresh migration/integration, desktop/mobile E2E, app/API/web containers, docs build/boot/link smoke, email/Storybook build. |
| CLI aliases/defaults | Omitted profile = SaaS; explicit SaaS default output parity; core defaults app/API; with-docs equals adding docs to resolved apps; malformed flags fail before target mutation. |

The six runtime cases above cover the two endpoints and standard surface set for each profile. Core's default duplicates its minimal case, so do not run it twice just because it has two names. All 32 installed cases catch intermediate-subset closure failures. Package caches may be shared; generated node_modules, databases, build outputs and source-relative links may not be shared across proof targets.

If full matrix cost becomes impractical, report measured cost and propose a reviewed change before claiming full profile support. Do not replace installation with a mocked package graph or silently skip a supported combination.

## Database and identity assertions

- SaaS: existing migration bytes unchanged, deploy from zero, seeded roles, last-Owner race protection, invitation integrity and tenant isolation stay correct.
- Core: four application tables only (Prisma bookkeeping excluded); all expected identity indexes/FKs present; schema and deployed catalog agree; seed adds no records.
- Both: real signup, verification, signin/signout and session persistence; unverified/suspended/deleted/expired users cannot use protected app surfaces as specified.
- Core: verify password recovery/token expiration/reuse and origin protections through the actual auth integration path; never seed a preverified identity as a substitute for the verification journey.
- Core APIs expose only health/readiness/status plus existing auth/docs infrastructure; removed product routes return 404 and are absent from the typed contract/OpenAPI.
- Core production API fails when required auth mail is unconfigured; SaaS retains mail and explicitly selected storage fail-fast proof. No real customer/provider delivery is necessary for local proof.

Use test-owned addresses, credentials and local mail outboxes. Pin the E2E transport/outbox to a task-owned local provider; never inherit a real SMTP/Resend transport for browser tests. Clean only the outbox, database rows/resources and processes created for this run.

## Output and independence assertions

- Fake `.env.local`, database/log/PID files and tool projections never reach generated source. Keep only explicit env examples; emitted `.env` derives from the generated example.
- Test copy selection separately from git/docker/repomix ignores. An ignored copied secret is a failure.
- App/package/source-only exclusions, symlink policy and target ancestry protections hold for all profiles.
- Core contains no removed package manifests/imports, domain Prisma models, organization app/API routes, invitations/mail exports, role seeding or super-admin bypass. Do not grep-ban HTML roles or explanatory docs.
- Generated profile assets, generator modules, source Harness/agent history and governance files are absent.
- Verify from a separate temporary target with target-owned node_modules and no NODE_PATH/source symlinks. Run an independent copy/container build whose context includes only the generated target. Do not rename/remove the user's source checkout to simulate independence.
- Generated release/runtime never reads the receipt to choose behavior. Receipt is an origin record, not a live project config.

## Evidence and failure handling (all executed)

For each phase report: source revision or tracked diff identity, generated profile/apps, actual Node/pnpm versions, commands/cwd, exit results, selected DB/container identity, browser evidence location and owned-resource cleanup. Store summaries under this plan's reports directory. Do not commit secrets, raw mail tokens, connection URLs or private logs.

All mandatory runtime proofs completed (see executed summary). Environmental blocks (e.g. redundant npm registry timeouts on maximal Docker) recorded separately from source defects; no source defect present.

Cleanup checks cover success, command failure and interruption. Never use broad docker prune, kill-all, database reset or deleting arbitrary temp roots. Keep primary and cleanup failures visible. Review against the final changed files after fixes; earlier green results do not establish a later revision's correctness. All evidence consolidated in reports/pm-2026-09-05-meldmark-feedback-completion.md.
