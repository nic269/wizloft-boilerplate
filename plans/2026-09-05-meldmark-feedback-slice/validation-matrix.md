# Validation Matrix

Date: 2026-09-05
Status: **REQUIRED FUTURE PROOF — NOT EXECUTED**
Scope: [plan](plan.md). Run against each phase's final source state; record actual commands, versions, result and output location.

## Layers and command ownership

| Layer | Required execution | What it proves / does not prove |
| --- | --- | --- |
| Focused | Phase-specific tests | Relevant behavior/negative cases; mocked errors do not prove Prisma adapter behavior. |
| Source release | `pnpm release:check` from source | Template catalog, lint, types, unit tests, boundaries, production builds. Does not include actual auth DB integration or browser/container proof. |
| Generated release | `pnpm release:check` inside a fresh target | Target-owned code/config/tests build without source-only commands. Use its own installed dependencies. |
| Database | Explicit deploy + selected integration suite on isolated PostgreSQL | Real migrations/constraints/auth/concurrency; package placeholder scripts are not DB proof. |
| Browser | `pnpm test:e2e:db` or target `pnpm test:e2e` against an explicitly provisioned isolated DB | Real identity/app journeys with fresh owned servers. |
| Container | `pnpm docker:validate` from applicable source/target | Production build/startup/provider/readiness and selected-surface behavior. |

Focused commands precede the full source gate. Do not separately rerun all commands already contained in release:check without a changed state or unresolved failure. Generated and source gates are different proofs and both are required where indicated.

## Per-phase required proof

| Phase | Additional to focused/source release |
| --- | --- |
| 01 / BP-01 | Existing Owner concurrency/last-Owner integration plus controlled real adapter conflict; one fresh generated SaaS smoke; `pnpm test:e2e:db` for auth/authorization regressions. |
| 02 / BP-02 | Positive/negative import fixture matrix, config rejection at execution, fresh generated boundary check plus generated release. |
| 03 / BP-03 | Contaminated fake source copy fixture, ignore behavior, all migration status states, fresh-server env override negatives, success/failure/interruption cleanup, generated release/E2E and production container proof where startup/context changed. |
| 04 / BP-05 | Git/directory/dirty receipt cases, deterministic digest, no-secret metadata, generated skip-install/install/validate modes, generated release without receipt dependency. |
| 05 / BP-04 | Full profile/app matrix below, auth/session/runtime proof for both profiles, unchanged SaaS migration hashes, output inventory/absence assertions. |

Before BP-04, preserve the generator's existing supported app contract; any selected-app defect found in mandatory proof is a real failure to report/fix in scope, not an implied test pass.

## Profile and app matrix

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

## Evidence and failure handling

For each phase report: source revision or tracked diff identity, generated profile/apps, actual Node/pnpm versions, commands/cwd, exit results, selected DB/container identity, browser evidence location and owned-resource cleanup. Store summaries under this plan's reports directory during implementation; do not commit secrets, raw mail tokens, connection URLs or private logs.

Use the equipped-tool query required by source policy before external tools. An absent optional capability can be skipped as an action, but a mandatory runtime proof remains pending until available. Record environmental blocks separately from code failures.

Cleanup checks cover success, command failure and interruption. Never use broad docker prune, kill-all, database reset or deleting arbitrary temp roots. Keep primary and cleanup failures visible. Review against the final changed files after fixes; earlier green results do not establish a later revision's correctness.
