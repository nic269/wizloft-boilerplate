# Reusable Boilerplate Feedback Plan

Date: 2026-09-05
Status: **DESIGN PREPARED — IMPLEMENTATION NOT STARTED**
Authorization: the owner requested this plan and supporting designs for a new implementation session. This document does not authorize code changes now.
Input: maintenance initiative. Implementation spans high-risk auth, generation and database contracts; classify individual work packets under current repository rules.

## Outcome

Improve the reusable application foundation using Meldmark evidence, while leaving workflow and product architecture choices with each generated project.

Deliver conflict correctness, configurable import boundaries, clean generation/runtime setup, an honest generation receipt, and two explicit starting profiles. Preserve the SaaS starter; add a smaller identity-first `core` starter. No Orca, OMP, Harness, AgentKit or slice-management prerequisite enters generated projects.

## Current evidence

- Source inspected at `8975877d44b82682c53f3c486e8b26299cffc4b9`; recheck the actual implementation baseline.
- Worktree initially had only this untracked plan directory. Preserve it and unrelated work; do not delete or hide WIP.
- Real gaps: conflict classification, external-import checks, copy exclusions, E2E environment precedence, and package/profile selection.
- Source observations and limits: [evidence and review](reports/source-review.md).
- Runtime, database, browser and generated-output checks have **not** been run for proposed changes.

## Execution order and dependencies

BP identifiers retain original proposal names; phase numbers define the revised order. Receipt moves ahead of profiles because it is independently useful. These are integration boundaries, not an agent/branch/worktree workflow.

| Order | Scope | Status | Dependency | Execution document |
| --- | --- | --- | --- | --- |
| 0 | Resolve source-repo instruction/tooling mismatch | Open precondition | None | [Session handoff](session-handoff.md) |
| 1 | BP-01: Serializable conflict correctness | Designed; unimplemented | Source precondition | [Phase 01](phase-01-serializable-conflicts.md) |
| 2 | BP-02: forbidden imports | Designed; unimplemented | Phase 01 for this sequence | [Phase 02](phase-02-forbidden-imports.md) |
| 3 | BP-03: copy hygiene, dev check, isolated E2E | Designed; unimplemented | Phase 02 | [Phase 03](phase-03-generation-runtime-hygiene.md) |
| 4 | BP-05: receipt only | Designed; unimplemented | Phase 03 copy contract | [Phase 04](phase-04-generation-receipt.md) |
| 5 | BP-04: core/SaaS profiles | Designed; unimplemented | Phases 02–04; profile design accepted in implementation scope | [Phase 05](phase-05-core-saas-profiles.md), [design](design-core-saas-profiles.md) |

Each phase leaves source and supported generated outputs independently releasable. Do not expose `--profile core` until the complete vertical output passes its gates. Preparatory commits may land with core unavailable.

## Design choices prepared for implementation

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

Changes to SaaS auth semantics, migration compatibility, default profile or proof requirements need a design amendment. Missing tools mean proof remains pending, never a pass.

## Completion

- Phases 01–05 implemented, reviewed where high-risk, and verified against final states.
- No-profile and explicit SaaS behave equivalently; historical SaaS migrations remain byte-identical.
- Core matches its package/schema/API/UI inventory and passes identity, migration, browser, build and container proof.
- Local data is absent from copy fixtures; generated release checks need no source checkout or workflow tools.
- Receipt is truthful for clean/dirty Git and packed/directory sources without overstating dependency reproducibility.
- Actual commands/results and owned-resource cleanup are recorded. Governance/reliability deferrals do not block completion.

## Next session

Use [session-handoff.md](session-handoff.md). Start with BP-01 unless the owner authorizes more. Branching, worktrees, agents and task tracking follow the selected environment and current source-repository instructions.
