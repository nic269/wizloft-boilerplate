# New Session Handoff

Date: 2026-09-05
Status: **PLANNING COMPLETE; NO IMPLEMENTATION EXECUTED**

## Read first

Read source README/AGENTS and current governing docs, then [plan](plan.md), the selected phase, [validation matrix](validation-matrix.md) and [source review](reports/source-review.md). BP-04 also requires the [profile design](design-core-saas-profiles.md).

This package supersedes the original combined proposal in this folder. Receipt is now Phase 04/BP-05; profiles are Phase 05/BP-04. Governance and reliability extraction are deferred and do not block completion.

## Facts to recheck

- Inspected source HEAD: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
- This planning session changes Markdown only inside this plan folder. The folder was untracked before work; no clean-commit assumption or commit authorization is implied.
- `.codex/skills/harness-intake-griller/SKILL.md` and `scripts/bin/harness-cli` were absent; `$HOME/AGENTS.md` and root CLAUDE.md were also absent when reviewed. Do not fabricate contents, intake records, stories, ADR acceptance or trace results.
- Installed source Prisma files indicated migrate-status support; no database or CLI runtime behavior was proved here. Recheck runtime versions and actual statuses during implementation.
- No production application, browser, database, container, dependency installation or source-generation execution occurred in planning.

## Source tooling precondition

Source AGENTS currently requires the project intake skill and Harness reads/matrix. The referenced local entrypoints are missing, while scripts/README.md and the prebuilt-CLI decision describe an older upstream installer. This is an unresolved **source-repository tooling contract**, not an application requirement.

First inspect current tracked instructions, release pins and any owner-approved install/update contract. Do not execute a floating upstream installer, copy tooling from Meldmark or silently replace the old Harness with a different runtime merely to unblock a CLI command.

If a current accepted restoration path is discoverable, prepare/perform only the bounded restoration within actual authorization and tool permissions, then verify the expected local skill/CLI. If policy is stale and no accepted path is discoverable, present the exact conflict and obtain a source-policy decision before dependent implementation. Do not repeatedly ask if the owner has already resolved it in the new session.

Once available, record selected intake/story/decision/trace evidence using the accepted tool and real commands. Do not create a global skill copy as a substitute for the required project skill. Missing tooling did not prevent this source-based design review; it is explicitly not represented as completed Harness intake.

## Narrow kickoff prompt

Paste the following only when ready to authorize BP-01 implementation:

> Work in `/Volumes/anh.nguyen/Projects/AnhN/wizloft-boilerplate`. Read current repo instructions and `plans/2026-09-05-meldmark-feedback-slice/plan.md`, `session-handoff.md`, `phase-01-serializable-conflicts.md`, and `validation-matrix.md`. I authorize BP-01 implementation according to this design; BP-02 through BP-05 remain out of scope. Resolve the documented source-tooling precondition through the accepted contract without importing Meldmark/Orca/OMP workflow. Inspect the actual HEAD and preserve this plan plus unrelated WIP. Implement only reusable conflict classification and its existing three-attempt Owner integration; do not add an observer framework. Prove actual PostgreSQL adapter conflicts and retained Owner behavior, run focused and final source/generated checks, obtain independent review, and report remaining proof gaps honestly. Do not publish, deploy, alter consumer repositories, or advance the next phase. Do not create a commit unless I separately request one.

For a later phase, explicitly name that phase and its linked design as the accepted scope. If the owner authorizes the whole plan, proceed through its dependencies without asking again at every phase; preserve high-risk review, accepted ADR recording and actual verification requirements.

## Design choices the next session need not reinvent

- SaaS remains default; core defaults to app/API with the exact package/schema inventory.
- Core removes Organization/RBAC and optional business/provider packages while retaining protected identity and auth mail.
- Root dev checks migrations without applying them; explicit deploy is the remediation for unapplied migrations.
- Receipt is passive metadata with dirty/unknown Git states and a generated-source digest; it neither pins dependencies nor certifies completion.
- Profiles apply only to fresh targets; no conversion or consumer database edits.
- No `--with-governance`, free-form capabilities, durable reliability extraction, agent runtime setup or workflow requirement is added to generated projects.

## Unresolved items

The only source-preparation decision still open is the missing intake/Harness contract if it cannot be resolved from accepted local evidence. Product/design defaults are concrete in this package but await implementation authorization. Runtime feasibility checks listed in phase plans are future proof obligations, not unanswered product questions.
