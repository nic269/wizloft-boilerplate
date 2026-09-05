# Phase 05 — BP-04: Core and SaaS Profiles

Date: 2026-09-05
Status: **COMPLETED**
Lane: high-risk (auth, schema, generator/public output, existing behavior) — completed.
Dependencies: BP-02 import/config checks, BP-03 hygiene/runtime semantics, BP-05 receipt — all complete.
Authority for proposed behavior: [profile design](design-core-saas-profiles.md) accepted and implemented. Validation: [matrix](validation-matrix.md) executed. See reports/pm-2026-09-05-meldmark-feedback-completion.md.
## Outcome and scope

Expose two complete generation profiles after their end-to-end proof. Preserve SaaS/default generation and add the specified 12-package/four-model core. No capability system, runtime profile switch, existing-database conversion, global auth rewrite or product domain scaffolding.

Before editing profile behavior, record an accepted profile ADR when the owner has authorized this linked design. Explain how it scopes the earlier [safety decision](../../docs/decisions/0021-generator-runtime-safety-boundaries.md) without changing SaaS. An authorization to implement this design resolves its proposed choices together; routine file organization does not require another product decision.

## Source-to-output change map

Paths below are repository-relative. New `.tpl` assets mirror target paths through explicit mappings. Exact leaf names can follow existing local conventions; target behavior and ownership cannot change implicitly.

| Existing area | Shared/SaaS action | Core action |
| --- | --- | --- |
| `boilerplate.init.json`, init schema/types/CLI | Add manifest v2 and profile selection; retain default CLI/app behavior. | Select explicit package/path/overlay definition. |
| `scripts/boilerplate-init/generator.ts` | One pipeline, selected-app handling and receipt integration. | Apply validated core composition assets. |
| `packages/database/prisma/schema.prisma`, migrations | Keep source SaaS bytes. | Target replaced by core identity schema/new baseline. |
| `packages/database/src/index.ts`, seed/tests, system-roles/tests, package manifest | Preserve source exports/seed semantics. | Remove system roles/dependency; identity exports and intentionally empty seed. |
| `packages/auth/src/access-control*`, permissions*, organizations*, invitations*, pagination* | Keep SaaS behavior and suites. | Remove domain-only implementations/tests/exports; drop pagination only after no retained consumer remains. |
| Auth server/options/session/keys/callback/client/middleware | Shared implementation, preserve security. | Keep; adjust tests that assume SaaS-only user fields/config. |
| `packages/auth/integration/postgres.integration.test.ts` | Split identity and organization integration into separate real suites while retaining existing coverage. | Keep actual identity suite, omit organization suite. |
| API contract/router indexes, health contract/runtime, feature-guards | Preserve SaaS composition. | Health-only indexes; mail-only readiness; no invitation guard. |
| `packages/api/src/app.test.ts`, openapi tests, client tests | Split generic versus SaaS route-dependent tests. | Keep generic errors/health/client assertions using existing health calls; remove organization client calls. |
| Config features/navigation/index/plans/routes and package manifest | Preserve SaaS features; fix generated dangling template export. | Dashboard/Settings/auth config; remove plans and source-only template exports. |
| `packages/mail/src/templates/index.tsx` | Extract small template leaves; keep public SaaS exports/rendering. | Verification/reset/shared leaves only. |
| Mail invitation implementation/tests and `apps/email/src/templates/invite-user.tsx` | Keep in SaaS. | Omit. |
| `apps/app` manifest, next.config, shell/dashboard/settings/invite | Preserve SaaS behavior. | Remove access-control dependency/transpile entry, tenant UI/routes; neutral authenticated shell. |
| `apps/web/app/page.tsx` | Preserve SaaS public behavior. | Neutral public page if selected. |
| `apps/docs/app/page.tsx` | Source catalog stays; generated shared asset fixes removed catalog dependency. | Generated project setup/API page if selected. |
| `.env.example`, `.env.test.example`, `turbo.json` | Preserve SaaS keys; retain Phase 03 dev contract. | Render selected keys and prune removed provider task env entries. |
| `boundaries.config.json`, package manifests/Next configs | Existing checks preserved. | Prune absent package policy/dependency/export references with executable validation. |
| E2E auth/support/organization/invitation files | Split neutral identity helpers from organization helpers; preserve SaaS tests. | Identity browser suite, protected-page/absence cases; no tenant test imports. |
| Docker validation script, generated CI, generated README/SPEC | Derive actual selected apps; fix optional-web assumptions for generated SaaS too. | App/API smoke, optional web, production mail fail-fast, identity integration. |

Remove entire core-excluded packages before copying so nested source tests/assets do not survive accidentally. Do not apply broad substring deletion to TypeScript/Prisma. Native ARIA roles, design-system vocabulary and explanatory docs are not tenant authority.

## Proposed new files

- `scripts/boilerplate-init/profile-resolver.ts` and its test: resolve CLI+manifest into package/app/path operations without mutation.
- `scripts/boilerplate-init/profile-output-validator.ts` and its test: check dependency/export closure and first-party output invariants.
- `scripts/boilerplate-init/profiles/core/definition.json`: explicit package set, removals, overlay mappings and JSON edits.
- `scripts/boilerplate-init/profiles/core/files/`: composition `.tpl` files and checked-in core schema/migration assets, mapped to target paths.
- `scripts/boilerplate-init/profiles/shared/files/`: generated docs and selected-surface validation composition where both profiles need it.
- `scripts/boilerplate-init/profile-generation.test.ts`: all output sets, no-profile/SaaS parity, negative inputs and contamination fixtures.
- `scripts/boilerplate-init/verify-generated-profiles.mjs`: source-only reproducible verification driver for installed generated targets; configurable test-owned root and subset/full matrix, explicit output/cleanup report.
- Profile ADR under `docs/decisions/` using the next available identifier after acceptance; do not preallocate a conflicting number.

## Implementation sequence

1. Capture source revision, clean/dirty state and SaaS migration hashes. Generate a pre-profile default output fixture for semantic comparison, without touching a consumer repo.
2. Record accepted profile decision. Lock the package/model/app matrix in tests and define manifest v2/path schema. Until the final step, core remains unavailable to the public CLI.
3. Extract only required shared seams: mail template leaves, neutral identity test helpers, generic API proof versus SaaS route proof. Keep source SaaS release gate green.
4. Author core schema/migration and explicit removals/compositions. Validate one minimal app/API output from its own directory early to discover genuine dependency gaps.
5. Implement pure resolution, path safety, structured JSON edits and output checks. Validate all options before target creation; target cleanup remains owned and bounded.
6. Complete optional web/docs/email/Storybook paths, profile-appropriate readiness/CI/Docker/E2E, env pruning and generated onboarding. All declared combinations must receive the matrix proof; do not silently narrow support.
7. Wire receipt profile/apps using the resolved plan. Compare no-profile to explicit SaaS excluding only explicitly variable receipt metadata/lockfile resolution artifacts.
8. Enable the public profile flag only when both full outputs pass their required proof. Update source product/architecture/release docs and record exact results/resource cleanup.

A partial branch may be used for iteration, but cannot be reported as releasable core. If a truly separate shared-defect fix is needed, integrate it with tests before resuming this phase; do not hide it inside a profile exception.

## Verification

Start with `pnpm exec vitest run scripts/boilerplate-init/profile-resolver.test.ts scripts/boilerplate-init/profile-output-validator.test.ts scripts/boilerplate-init/profile-generation.test.ts`, then focused changed-package tests and source `pnpm release:check`.

The new verification driver must execute target-owned install/release/database/browser/container commands, not merely assert files exist. Exact invocation is documented when implemented; this plan does not claim the driver exists now. Required scenarios are specified in the matrix, including all 32 selected-app sets for generation/dependency/type/build proof.

For identity and schema proof, use dedicated empty PostgreSQL resources. Keep both profile migrations, identity sessions and mail verification real. For core, prove signup/verification/signin/signout, protected pages, suspension/deletion/expiry rejection, and token recovery behavior. SaaS retains Owner/invitation/tenant-isolation proof.

No-profile and explicit SaaS output must agree semantically with the permitted deltas in the design. Browser proof must exercise desktop and mobile; inspect changed shell/mail-preview/docs surfaces where applicable. Do not claim provider delivery beyond test-owned local mail evidence.

## Acceptance

- Core = 12 retained packages, four application models; absent domain packages/routes/exports/env/seed/test assumptions are mechanically checked.
- SaaS remains default with the existing app set and unchanged migration history/auth semantics.
- Core auth is protected; no fake admin, allow-all grants or preverified seeded user.
- Every supported app combination installs, typechecks, passes boundaries and builds; representative full suites plus required runtime matrix pass independently of the source checkout.
- Broken selected-docs catalog references and missing-web container assumptions are corrected for generated outputs without weakening source SaaS tests.
- Receipt reports selected profile/apps accurately; changing/deleting it does not alter runtime or release behavior.
- Both generated profiles carry useful tests/CI and no profile generator, local tooling, governance or source-history artifacts.

## Risks and rollback

Largest risks: duplicated auth behavior in overlays, schema/SQL drift, stale removed-package references, source tests discovering templates, and optional-surface assumptions in runtime scripts. Mitigate with shared implementation, explicit assets/operations, catalog-level DB proof and the complete selection matrix.

Rollback disables/reverts profile support and its source-only assets. Shared fixes can remain only with their own evidence. No generated consumer or existing database is migrated or reset by rollback. Failure to satisfy the profile matrix leaves this phase incomplete; it does not affect completion evidence of earlier integrated phases.

## Completed evidence

- Installed full profile matrix 32/32 on Node 24.20.0 and pnpm 11.23.0 (all gen+install+type+boundary+build).
- Core = exactly 12 packages, four application models (User/Session/Account/Verification); absent packages/routes/exports/env/seed mechanically enforced.
- SaaS remains default; migration bytes unchanged; no-profile == explicit SaaS (permitted deltas only).
- Generated core-minimal: 1 identity integration + 12 browser tests passing; source: 5 integration + 16 browser.
- Six representative runtime configs: release/E2E/Docker evidence composed (maximal docs booted+API docs after env fix).
- Core auth protected (no fake admin etc); receipt accurate for profile/apps; profiles carry tests/CI, no source artifacts.
- Focused profile tests + source release:check green; generated independent.
- Final reviewer confirmed all prior gaps resolved.

## Acceptance (evidence-backed)

- [x] Core = 12 retained packages, four application models; absent domain packages/routes/exports/env/seed/test assumptions are mechanically checked.
- [x] SaaS remains default with the existing app set and unchanged migration history/auth semantics.
- [x] Core auth is protected; no fake admin, allow-all grants or preverified seeded user.
- [x] Every supported app combination installs, typechecks, passes boundaries and builds; representative full suites plus required runtime matrix pass independently of the source checkout.
- [x] Broken selected-docs catalog references and missing-web container assumptions are corrected for generated outputs without weakening source SaaS tests.
- [x] Receipt reports selected profile/apps accurately; changing/deleting it does not alter runtime or release behavior.
- [x] Both generated profiles carry useful tests/CI and no profile generator, local tooling, governance or source-history artifacts.
