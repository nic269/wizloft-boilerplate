# Generation Profiles and Passive Receipts

Date: 2026-09-05

## Status

Accepted

## Context

The source boilerplate is a complete SaaS baseline, but new products do not all need organizations, billing, storage, jobs, CMS, analytics, or other product and provider domains. Selecting only app surfaces cannot safely remove those packages because database models, routes, configuration, manifests, migrations, tests, and documentation remain coupled. Generated projects also need reproducible origin evidence without creating a runtime dependency on the source repository or Git.

## Decision

Generation has two explicit profiles. `saas` remains the default and preserves the prior full baseline. `core` emits an identity-first foundation containing only `User`, `Session`, `Account`, and `Verification`; signup, email verification, password recovery, sessions; health and readiness; and neutral protected app/API UI. Product domains and unused providers are removed across code, schema, migrations, environment contracts, manifests, boundaries, tests, and optional surfaces.

Profile selection and app-surface selection are orthogonal. App and API remain required. Web, docs, email preview, and Storybook are independently optional. The generator validates the resulting package inventory, workspace dependency closure, forbidden core paths, and core database model inventory.

Every generated project receives `boilerplate.receipt.json`. The receipt records the selected profile and apps, generator/toolchain identity, best-effort Git source identity, and a deterministic path-and-content digest of generated source before dependency installation. Local environment, database, cache, lock, and receipt files are excluded. The receipt is passive metadata: no build, runtime, CI, or package boundary reads it.

## Alternatives Considered

1. Keep one full scaffold and ask users to delete domains manually. Rejected because cross-layer deletion is error-prone and cannot be validated centrally.
2. Treat app selection as the profile mechanism. Rejected because surfaces and domain capabilities are different contracts.
3. Build profiles as independent repositories or long-lived branches. Rejected because they drift from shared fixes and toolchain changes.
4. Make generated projects depend on source Git history or a remote template service. Rejected because generation must work from archives, vendored copies, and shallow or unavailable Git metadata.

## Consequences

Positive:

- Existing users receive the same SaaS output when `--profile` is omitted.
- Identity-only products start without unused domain schema, provider configuration, or workspace packages.
- Every supported profile/app subset is structurally generated and validated from one manifest.
- Generated source has deterministic, portable origin evidence without runtime coupling.

Tradeoffs:

- The core profile owns a small set of profile overlays for schema, routes, UI, mail templates, and tests.
- Clean generated installs must retain schema-compatible dependency versions where upstream packages make breaking schema changes in a minor release.
- Adding a new retained capability requires updating its complete cross-layer slice and the profile matrix.
