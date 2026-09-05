# Design: Core and SaaS Generation Profiles

Date: 2026-09-05
Status: **IMPLEMENTED / ACCEPTED (via plan completion)**
Owner: BP-04 / [Phase 05](phase-05-core-saas-profiles.md).
Source baseline: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
Evidence: all acceptance in reports/pm-2026-09-05-meldmark-feedback-completion.md; 32/32 matrix, core 12/4, proofs green.
## Decision and rationale

Use two named generation profiles. Keep the source checkout runnable as SaaS and preserve that default output. Generate core with explicit composition replacements and a separate initial identity schema. Share actual auth/session, mail transport, API error handling and design-system implementations.

The current generator selects apps but copies every package and the entire SaaS database. Flags cannot remove that schema or its authorization assumptions. Core removes unused behavior at generation time. No runtime profile branches, plugin framework or arbitrary capability combinations.

Core establishes identity-first foundations; it does not implement authorization for future product data.

## CLI and app selection

```text
pnpm boilerplate:init ../product --profile saas --validate
pnpm boilerplate:init ../product --profile core --validate
pnpm boilerplate:init ../product --profile core --apps app,api,web --validate
pnpm boilerplate:init ../product --profile core --with-docs --validate
```

| Input | Resolution |
| --- | --- |
| Profile omitted | `saas`. |
| SaaS, apps omitted | Existing order: `app,web,api,email,storybook`. |
| Core, apps omitted | `app,api`. |
| Explicit apps | Exact requested apps, deduplicated as today; app/API required. |
| `--with-docs` | Add docs to the resolved apps for either profile. |
| Unknown/missing profile value, unknown apps, missing required apps | Error before target creation. |
| Repeated/conflicting profile flags | Error before target creation. |
| `--capabilities`, `--with-governance` | Unsupported flag error. |

All subsets of optional web/docs/email/Storybook are supported: 16 sets per profile. Ordering is deterministic; receipt uses the resolved app list. No profile-switch/update command for existing targets. Preserve stack, ports and package naming; API-only, web-only and no-auth outputs remain unsupported.

## Exact package inventory

SaaS keeps the current 20 packages after existing source-only exclusions. Core keeps exactly 12. Future additions require updating the profile contract and proof matrix.

| Package | SaaS | Core |
| --- | --- | --- |
| `@repo/api` | Existing behavior | Health/readiness/status, OpenAPI/client infrastructure, Better Auth mount; no product CRUD. |
| `@repo/auth` | Identity and Organization/RBAC | Identity/session, client/server, keys, callback validation, middleware; no organization/permission APIs. |
| `@repo/config` | Existing flags/navigation/plans | App identity, routes, auth flags, Dashboard/Settings navigation. |
| `@repo/database` | Existing schema/migrations/seed | Four identity models, client/keys, conflict classifier; no role seeding. |
| `@repo/design-system` | Keep | Same generic source-owned components/providers/styles. |
| `@repo/helpers` | Keep | Technical utilities. |
| `@repo/logger` | Keep | Structured operational logging. |
| `@repo/mail` | Keep all | Transport/keys/header validation and verification/reset templates; no invitations. |
| `@repo/observability` | Keep | Optional instrumentation; no mandatory credentials. |
| `@repo/security` | Keep | Existing technical security helpers. |
| `@repo/test` | Keep | Shared test utilities. |
| `@repo/typescript-config` | Keep | Compiler configuration. |
| `@repo/access-control` | Keep | Remove; no Capability Grants or dummy allow-all replacement. |
| `@repo/analytics`, `@repo/billing`, `@repo/cms` | Keep | Remove packages, config, env keys and marketing claims. |
| `@repo/flags`, `@repo/i18n` | Keep | Remove unused optional packages and policy entries. |
| `@repo/jobs`, `@repo/storage` | Keep | Remove packages, routes, provider probes, env keys and persistence. |

Mail remains because verification/reset are active identity behavior. Storage/jobs and their persistence wait for a product requirement. Core does not retain inactive business tables as latent authority.

## Persistence and migrations

Core has exactly User, Session, Account and Verification, plus Prisma's internal migration bookkeeping after deployment.

- Preserve existing identity fields/types, mappings, IDs, expiry/token fields and account/verification credentials.
- Preserve unique user email/session token indexes, user foreign keys/cascades, and session/account user indexes.
- User.status uses `UserStatus { ACTIVE, SUSPENDED }`, default ACTIVE. Remove INVITED, isSuperAdmin and memberships/invitations/audit/files relations.
- Remove Organization, Membership, Role, RolePermission, Invitation, AuditLog, FileAsset, WebhookEvent, JobRun, JobLog, IntegrationConnection, FeatureFlag and associated enums.
- Do not add new identity constraints or session policies during extraction. Adapter incompatibility needs an evidence-backed correction.

Keep the core schema and initial migration in the generator's core profile assets. Replace only the **target's** schema/migrations with the selected files. Never rewrite source SaaS migration history. Migration names describe identity behavior, not BP numbers or product slices.

Deploy checked-in migrations to a new empty database. Generated README requires a new database for a newly selected profile and disclaims in-place conversion. The generator never connects to a database; db:push stays disposable-only.

Core has no baseline domain records. Keep db:seed as an intentional empty seed entrypoint that reports no data to seed; it creates no user, privilege or sample record. This is the actual data contract, not fabricated setup success. Migration/readiness prove connectivity.

Fresh migration and zero-diff schema proof must agree. Inspect actual catalog constraints/foreign keys as well as schema text. SaaS migration hashes must match the pre-phase snapshot exactly.

## Identity and security

Reuse createAuthOptions, auth, getCurrentSession, callback validation and browser client. Preserve password limits, verification/reset defaults, trusted origins, cookies, session expiry and live ACTIVE-user/verified-email checks. Optional Google retains current behavior.

Remove permissions/access-control/organizations/invitations exports and implementations. Keep getCurrentSession's live-user lookup; cookie presence is not authorization. Suspended, deleted, expired and unverified sessions cannot use protected app pages under configured policy.

Shared auth-options remains independent of invitation config. Core AuthFeatureConfig contains passwordReset and requireEmailVerification, both enabled by default. SaaS still contains organizationInvitations. Do not reduce auth protection to make core tests pass.

Better Auth remains mounted under /api/auth/*. No new resource endpoint is invented to make core appear complete. Future application services must enforce ownership/authorization when adding data.

## API composition

Keep generic Hono app/error/context handling, oRPC client and OpenAPI generator. Core's contract/router indexes include only the existing health group. Preserve /health, /ready, /status, /openapi.json, /docs/api and Better Auth.

Core /ready describes database connectivity and **mail only**; schema and response agree. Enabled auth delivery still requires configured production mail. No fake disabled jobs/storage entries or imports. SaaS keeps its current three-provider readiness response.

Remove files/jobs/organizations/invitations contracts/routers and the invitation guard. Retain reset/verification endpoint guards and safe error envelopes/request IDs. Removed paths return the existing 404 and are absent from OpenAPI/typed clients.

Split mixed source tests at behavior boundaries. Keep generic context, health, auth guards and error masking in both profiles. SaaS retains organization/permission/invitation/files/jobs suites. Core adds absence and identity tests; do not use empty suites or blanket skips to obtain green checks.

## App, mail preview and docs

| Surface | Core output |
| --- | --- |
| App / | Existing redirect to /dashboard. |
| Auth pages | Existing signup/signin/verify/resend/reset/recovery. |
| Dashboard | Protected shell, identity, signout, neutral empty state; no sample metrics/provider cards. |
| Settings | Protected neutral empty state; no member/role/access management. |
| Removed app routes | /invite/*, /settings/members, /settings/access; no dangling nav. |
| Optional web | Public sign-in/sign-up links and branding; no pricing/provider promises. |
| Optional email | Verification/reset previews only. |
| Optional Storybook | Generic design-system examples. |
| Optional docs | Project setup/API reference for actual profile/apps; no source catalog/governance. |

Existing docs imports @repo/config/templates, which generation removes. Both profiles need a neutral generated docs page and removal of the dangling config export. Keep the source boilerplate docs/catalog intact. This is a scoped generated-docs defect correction, not a SaaS redesign.

Split mail templates into verification, password-reset, invite-user and shared presentation leaves; preserve SaaS public exports and rendering. Core omits the invitation leaf/export, invitation.tsx/tests and preview. Retain auth transport/header safety tests.

Use existing component focus/accessibility contracts. “No Organization/RBAC footprint” means first-party product symbols/routes/schema/tests; it does not ban HTML role attributes, generic icons or profile explanations in docs. No Meldmark visuals or governance validator.

## Config, dependencies and deployment

- Filter all dependency sections and exports using explicit operations. A retained import of a removed package is an error, not permission to silently restore it.
- Prune Next transpilePackages, boundary keys/values/client-safe entries and stale test imports. Keep declaration/export/cycle checks.
- Core drops config plans/template exports and billing/CMS/analytics/jobs/storage/i18n flags. authMailRequired still derives from active auth delivery. SaaS flags remain unchanged.
- Env examples keep database/auth/mail, optional Google/observability and selected URL contracts. Remove Stripe/CMS/PostHog/storage keys and associated Turbo env entries.
- Auth currently requires NEXT_PUBLIC_WEB_URL. Without web, generated defaults use the app origin; with web, its own origin. This is a public/auth-origin setting, not a workspace promise. Do not broaden trusted origins silently.
- Optional docs URL appears only when needed. Preserve root/direct dotenv loading. Never copy source environment values.
- Keep the shared Dockerfile/targets. Generated smoke derives selected surfaces from generated appSurfaces, not the receipt or source/generator modules. Always test app/API; web only if present. Email/Storybook are tooling builds.
- Core retains production mail-failure/database readiness proof; SaaS retains invalid-storage fail-fast proof. Use explicit generated configuration, not catch-and-skip, to select applicable probes.
- Generated CI keeps install/generation/migration/lint/types/tests/boundaries/build and adds actual selected-profile auth integration/browser proof with Chromium installation. No source-template or workflow-tool commands.

## Generator shape

Keep one pipeline. Extend the private init manifest to version 2 with defaultProfile=saas and named profile definitions. Preserve CLI behavior, not arbitrary old-manifest/new-binary mixing: version 1 with the new generator fails before target creation with an actionable mismatch error. No general manifest migration engine.

Proposed source-only modules/assets:

```text
scripts/boilerplate-init/
  profile-resolver.ts
  profile-resolver.test.ts
  profile-output-validator.ts
  profiles/
    core/definition.json
    core/files/...
    shared/files/...
```

Definitions hold exact packages, default apps, removals, overlay mappings and structured JSON edits. Reject unknown keys, duplicate destination writes, absolute/parent paths, unsupported packages and protected-output overlaps. Assets never survive in generated output.

Use .tpl suffixes and explicit source-to-target maps so source Vitest/TypeScript do not execute templates. Generated output is compiled/tested. No second complete starter or regex parser for Prisma/TypeScript. Overlay composition variants and schema/migrations; copy canonical shared implementations.

Pipeline:

1. Validate CLI, manifest, target ancestry and install/validate combination.
2. Resolve profile/apps/packages/exclusions/overlays/JSON edits into an immutable plan; validate files and paths before mutation.
3. Copy allowed shared source, omit unselected behavior/apps/packages, apply assets and structured edits. App-conditioned overlays are omitted for unselected apps.
4. Apply branding after composition; render README/SPEC/docs from resolved values. Earlier rewrites cannot recreate removed exports.
5. Verify dependency/export closure, valid boundary entries and expected paths/models/routes. On failure clean only this invocation's newly created target.
6. Apply common hygiene; finalize snapshot digest/receipt under BP-05. Create local .env from the generated example; install/validate under existing options.

Resolver validates dependencies; it does not automatically add packages to satisfy leftover imports. Definitions remain reviewed sets. All 32 app/profile combinations receive structural proof; installed proof is in [validation-matrix.md](validation-matrix.md).

## Compatibility and rollout

- Compare omitted profile with explicit SaaS and the pre-profile output. Permitted deltas: integrated conflict/hygiene/receipt work, generated docs fix, valid config exports and generated validation improvements.
- Existing generated projects are untouched; profiles apply to new targets only.
- A new profile ADR scopes the earlier “Organizations are unconditional core behavior” decision to SaaS. Do not silently overturn the accepted source decision.
- Rollback reverts/disables profile generation. No existing product DB rollback is involved.
- Record 12 vs 20 packages and 4 vs 16 models, plus absence of forbidden first-party behavior. Meldmark's deleted line count is not a generic savings estimate.

## Decision status

All product choices had concrete defaults. BP-04/05 authorization accepted them together via plan. Full execution + matrix + runtime + source proof complete. SaaS preserved, core delivered per inventory. No drift requiring amendment in this scope. See phase-05 and implementation report for evidence.

Status: IMPLEMENTED (plan complete).
