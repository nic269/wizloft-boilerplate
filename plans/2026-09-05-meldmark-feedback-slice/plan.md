# Reusable Boilerplate Feedback Plan

Date: 2026-09-05
Status: **COMPLETED**
Authorization: full plan authorized and executed; all phases verified.
Input: maintenance initiative. Implementation spans high-risk auth, generation and database contracts; classify individual work packets under current repository rules.

## Outcome

Improve the reusable application foundation using Meldmark evidence, while leaving workflow and product architecture choices with each generated project.

Deliver conflict correctness, configurable import boundaries, clean generation/runtime setup, an honest generation receipt, and two explicit starting profiles. Preserve the SaaS starter; add a smaller identity-first `core` starter. No Orca, OMP, Harness, AgentKit or slice-management prerequisite enters generated projects.

## Current evidence

- Source inspected at planning `8975877d44b82682c53f3c486e8b26299cffc4b9`; final revision green.
- All phases complete with evidence; see [implementation report](reports/pm-2026-09-05-meldmark-feedback-completion.md).
- Source observations and limits: [historical review](reports/source-review.md) (all remediated).
- Full grounded results: source release:check green (template validation, formatting, typecheck, unit tests, boundaries, build); installed full profile matrix 32/32 on Node 24.20.0 and pnpm 11.23.0; focused 71 passing + interruption-cleanup; source PostgreSQL/E2E 5 int +16 browser without a source `.env`; generated core-min 1 int +12 browser; six runtime configs composed release/E2E/Docker; maximal docs booted+API docs post env fix; redundant Docker only npm timeouts (no source defect); real Serializable and deadlock wrappers captured/classified + unit bounded retry + owner race 1 Owner+1 audit; SaaS migration bytes unchanged. Final reviewer all gaps resolved.
## Execution order and dependencies

BP identifiers retain original proposal names; phase numbers define the revised order. Receipt moves ahead of profiles because it is independently useful. These are integration boundaries, not an agent/branch/worktree workflow.

| Order | Scope | Status | Dependency | Execution document |
| --- | --- | --- | --- | --- |
| 0 | Resolve source-repo instruction/tooling mismatch | Complete | None | [Session handoff](session-handoff.md) |
| 1 | BP-01: Serializable conflict correctness | Complete | Source precondition | [Phase 01](phase-01-serializable-conflicts.md) |
| 2 | BP-02: forbidden imports | Complete | Phase 01 for this sequence | [Phase 02](phase-02-forbidden-imports.md) |
| 3 | BP-03: copy hygiene, dev check, isolated E2E | Complete | Phase 02 | [Phase 03](phase-03-generation-runtime-hygiene.md) |
| 4 | BP-05: receipt only | Complete | Phase 03 copy contract | [Phase 04](phase-04-generation-receipt.md) |
| 5 | BP-04: core/SaaS profiles | Complete | Phases 02–04; profile design accepted in implementation scope | [Phase 05](phase-05-core-saas-profiles.md), [design](design-core-saas-profiles.md) |

Each phase leaves source and supported generated outputs independently releasable. Core exposed after full gates passed. All proof recorded.

| Topic | Proposed contract |
| --- | --- |
| Compatibility | Omitted profile stays SaaS; existing default apps stay app/web/api/email/Storybook. |
| Core | Default app/API; four identity models, authenticated shell, verification/reset mail, build/test/deployment foundations. Exact inventory: profile design. |
| Authorization | Session and active-account protection; no Organization/RBAC, super-admin, Capability Grants or implied cross-user access. |
| Profiles | Generation-time selection; no runtime schema switch or existing-project conversion. |
| Dev startup | Root `pnpm dev` checks migration status; applying migrations remains explicit. Direct workspace dev is a documented low-level entrypoint. |
| Copy safety | Filter selected bytes before copy; ignore files are separate protection. Keep env examples; exclude local values and tool projections. |
| Receipt | Passive versioned metadata: nullable Git identity, dirty disclosure, output digest, resolved options and toolchain. No completion/reproducibility claims. |
| Reliability | Preserve SaaS behavior; no new durable worker, Outbox, Inbox, audit subsystem or transaction observer API. |
| Tooling | No agent config seeds, runtime materialization or worktree rules in generation. |

These recommendations are not already-accepted ADRs. A later instruction accepting a phase and linked design can authorize them together; do not re-ask about each accepted row. Raise a material source conflict or actual unresolved choice.

## Outside this initiative

- BP-05 governance seed (`--with-governance`, START-HERE/CURRENT-STATUS/SOURCE-OF-TRUTH/active-slice files): defer to a separate optional template/tool initiative.
- Neutral UI guidance may later cover accessibility, state completeness and honest persistence. No governance validator or visual style pack here.
- BP-06 reliability extraction: defer until another concrete consumer supplies operational requirements. No interfaces-only scaffold or separate reliability package is needed to finish this plan.
- No free-form capabilities, profile conversion, upgrade service, deployment, remote setup, automatic commits/tags or dependency upgrade campaign.
- No Meldmark business code, palette, typography, layout, capability policy, worker or Orca/OMP runbook is copied.

## Validation and release

Run phase-focused tests, then one source `pnpm release:check` on final code. It already includes lint/types/tests/boundaries/build; do not duplicate the ladder without new changes or failures.

Verify generated output from its own directory with its own dependencies. Database and container changes require real isolated runtime proof. See [validation matrix](validation-matrix.md) for supported combinations, negative cases and evidence.
Changes to SaaS auth semantics, migration compatibility, default profile or proof requirements need a design amendment. In this execution, all required tools available; full proof executed and green (source gate, matrix 32/32, runtimes). Missing tools in future would keep proof pending, never a pass.
## Completion

- Phases 01–05 implemented, reviewed where high-risk, and verified against final states.
- No-profile and explicit SaaS behave equivalently; historical SaaS migrations remain byte-identical.
- Core matches its package/schema/API/UI inventory and passes identity, migration, browser, build and container proof.
- Local data is absent from copy fixtures; generated release checks need no source checkout or workflow tools.
- Receipt is truthful for clean/dirty Git and packed/directory sources without overstating dependency reproducibility.
- Actual commands/results and owned-resource cleanup are recorded. Governance/reliability deferrals do not block completion.
- Source release:check green on final revision (template validation, formatting, typecheck, unit tests, boundaries, build).
- Installed full profile matrix 32/32 on Node 24.20.0 and pnpm 11.23.0.
- Focused implementation suite 71 passing plus interruption-cleanup test passing.
- Source PostgreSQL/E2E: 5 integration and 16 browser tests passing without a source `.env`.
- Generated core-minimal PostgreSQL/E2E: 1 identity integration and 12 browser tests passing.
- Six representative runtime configurations composed evidence for release/E2E/Docker.
- Both maximal docs apps booted and exposed API docs (generated env propagation fixed).
- Redundant maximal Docker retries: npm registry timeouts only (no source defect).
- Real Serializable adapter conflict observed/classified; unit tests prove bounded retry/exhaustion; owner race proves 1 surviving Owner + 1 audit event.
- SaaS migration bytes unchanged.
- Final reviewer confirmed all prior gaps resolved. No source blocker.

See [implementation report](reports/pm-2026-09-05-meldmark-feedback-completion.md) for full mapping and per-phase evidence.

## Next session

Implementation complete. Read [implementation report](reports/pm-2026-09-05-meldmark-feedback-completion.md) first. The plan subtree now gives one consistent answer: complete, all review findings remediated, final source gate green, matrix 32/32, proofs green, no source blocker. Links valid. Use [session-handoff.md](session-handoff.md) only for historical context. Branching, worktrees, agents and task tracking follow the selected environment and current source-repository instructions.
