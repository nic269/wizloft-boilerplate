# Source Review and Planning Evidence (Historical)

Date: 2026-09-05
Status: **HISTORICAL SOURCE REVIEW; ALL GAPS REMEDIATED BY IMPLEMENTATION**
Source HEAD: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
Final implementation baseline and evidence recorded in implementation report.
## Historical source observations (pre-implementation)

| Observation | Source | Design consequence |
| --- | --- | --- |
| Conflict classifier checks only top-level P2034; existing Owner retry limit is three. | [access-control](../../../packages/auth/src/access-control.ts) | BP-01 adds infrastructure classification, preserves retry/domain mapping. |
| Auth test excludes integration; actual Owner race test exists separately. | [auth manifest](../../../packages/auth/package.json), [integration](../../../packages/auth/integration/postgres.integration.test.ts) | Real DB integration is explicit; release:check alone is insufficient. |
| Boundary engine skips non-workspace imports; schema has no external bans. | [engine](../../../scripts/boundaries/boundary-engine.ts), [schema](../../../scripts/boundaries/boundaries.schema.json) | Add optional executable import policy before the skip. |
| Generator copy uses manifest path filters; ignores are separately overwritten. | [generator](../../../scripts/boilerplate-init/generator.ts), [manifest](../../../boilerplate.init.json) | Prevent copying local state before writing downstream ignores. |
| Exact source exclusions lack .env variants and newer local tool roots. | [manifest](../../../boilerplate.init.json) | Fake contamination fixtures and explicit exclusions, no secret reads. |
| E2E process.env can override fresh/local defaults; project identity/finally cleanup already exist. | [runner](../../../scripts/e2e-with-db.mjs), [Playwright](../../../playwright.config.ts) | Pin runner-owned values; preserve cleanup and improve readiness. |
| Root dev starts Turbo; migrations are separate. | [package](../../../package.json) | Check-only preflight, no implicit migration deployment. |
| Generator selects apps, retains all 20 packages and 16 Prisma models. | [manifest](../../../boilerplate.init.json), [schema](../../../packages/database/prisma/schema.prisma) | Explicit core inventory: 12 packages and four models. |
| Auth session performs live user status/verification lookup. | [session](../../../packages/auth/src/session.ts) | Preserve protection when removing permissions/RBAC. |
| Readiness schema/runtime requires jobs/mail/storage. | [health contract](../../../packages/api/src/contracts/health.ts), [health runtime](../../../packages/api/src/health.ts) | Core changes both composition sides to mail-only. |
| Invitation mail shares a template module with verification/reset. | [mail templates](../../../packages/mail/src/templates/index.tsx) | Extract leaves, preserve SaaS exports, omit core invitation leaf. |
| Selected docs app imports a template export removed by generation. | [docs page](../../../apps/docs/app/page.tsx), [generator](../../../scripts/boilerplate-init/generator.ts) | Shared neutral generated docs page; source catalog stays. |
| Source generation copies current working files and skip-install removes its lockfile. | [generator](../../../scripts/boilerplate-init/generator.ts) | Dirty-aware receipt plus output digest; no dependency reproducibility claim. |
| Accepted decision makes Organizations unconditional in the current starter and defers durable jobs. | [decision](../../../docs/decisions/0021-generator-runtime-safety-boundaries.md) | New profile ADR scopes organization behavior to SaaS, no universal rewrite. |

## Meldmark provenance used as evidence

The original proposal references `meldmark-next/docs/migration/PROVENANCE.md`, `docs/implementation/SLICE-0-TRANSFORMATION-LEDGER.md`, `docs/implementation/ORCA-OMP-WORKFLOW.md` and CURRENT-STATUS.md in the sibling product checkout. These were read during review. Their runtime claims are historical records, not independently repeated proof here.

Recorded provenance: boilerplate input is the source HEAD above; untouched product baseline `332fa9c28a9a923b63d6d125950172a152ed6096`; Slice 0 implementation `2b056432a5a8ae0a2b6cea79aeb56fb9bff083fe`. The original proposal names Slice 1 completion `336eb31`; that hash was not independently reverified for this plan.

Orca/OMP primary-checkout preferences and regenerable tool projections are product workflow evidence only. This plan adopts output independence/local-state hygiene without adopting that workflow. Historical transformation line counts mix generic fixes and product specialization, so no savings forecast is based on those counts.

## Verification performed in planning (historical)

- Read current source instructions, README, Harness/intake/architecture/context/tool registry docs, selected decisions and affected generator/runtime code.
- Read package manifests and schema to enumerate 20 packages/16 models and derive the proposed inventory.
- Confirmed missing project intake skill and Harness CLI; no global substitute used, no durable records fabricated.
- A separate read-only reviewer checked BP-01–03 source contracts and drafted their phase documents; controller owns integration and plan choices.
- Only Markdown under this plan folder is changed during planning. No implementation, test/build, database, browser, container, dependency install or generated-project proof was executed in planning phase.

Documentation link/consistency checks are separate from runtime validation. This source review is retained as planning history; actual release evidence is in the implementation report and phase completion records.

## Documentation closeout (historical)

- Checked all 10 Markdown files: local links resolve, status fields exist, no trailing whitespace.
- Reconciled phase order/BP identifiers and source-only versus generated-project responsibilities.
- A review identified inherited real-mail configuration as inconsistent with isolated E2E proof; Phase 03 now pins console transport and a task-owned outbox, with a negative fixture requirement.
- Profile inventories, receipt lifecycle, migration preflight and handoff authorization are explicit.
- Git status still reports only this plan directory as untracked at planning time; no tracked application/configuration file was changed and no commit was created during planning.

All prior gaps listed in observed facts were remediated during implementation. Final reviewer confirmed resolution. See implementation report for exact evidence.
