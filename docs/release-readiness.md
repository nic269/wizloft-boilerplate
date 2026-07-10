# Release Readiness Audit

## Status

Ready for first real project fork with known caveats.

This boilerplate now has the reusable core expected for a future SaaS, education,
internal tool, or Shopify-adjacent project. The remaining work should be driven
by the first concrete product spec rather than by speculative template scaffold
code.

## Audited Baseline

| Area | Status | Evidence |
| --- | --- | --- |
| Monorepo tooling | Ready | pnpm, Turbo, Ultracite-on-Biome, TypeScript strict, workspace package boundaries. |
| Environment workflow | Ready | Root `.env.example`, root `.env` loading through `dotenv-cli`, package-level typed env contracts. |
| Database | Ready | Migration-first setup, forward migrations, scoped job idempotency, pending-invitation and integration identity indexes, organization-owned integration FK, invitation-role FK, durable expiry, scoped feature flags, catalog-reconciled system roles. |
| Auth | Ready | Required verified email, callback-safe auto sign-in, suspended-user access enforcement, branded verification/reset delivery, private development outbox, and recovery screens. |
| Organizations and access | Ready | Organization onboarding, race-safe invitations, RBAC, member management, Serializable last-owner protection, protected Owner assignment, and cursor-paginated access/audit lists. |
| API | Ready | Hono app, contract-first oRPC implementation, `/health`/`/ready`/`/status`, provider-aware readiness, bounded pagination, and OpenAPI handoff. |
| Providers | Ready with feature requirements | Local fallbacks report truthful modes; enabled production auth requires real mail; selected Resend/SMTP/S3/R2 configurations fail startup/readiness when incomplete. |
| UI system | Ready | Design-system provider, shared global tokens, app-owned CSS override seams, Storybook surface. |
| Handoff surfaces | Ready | `apps/web`, `apps/docs`, `apps/email`, `apps/storybook`. |
| Release validation | Ready | `pnpm release:check`, deterministic six-journey browser E2E, and production Docker proof for fail-fast, public assets, and app/API/web readiness. |
| Templates | Catalog-ready | Typed catalog and README tracks exist in the source boilerplate; generated projects remove source-only catalog exports. |

## Release Checks

Use this ladder before promoting the boilerplate or cutting a project fork:

```bash
pnpm install
pnpm templates:validate
pnpm check:ci
pnpm check-types
pnpm test
pnpm boundaries
pnpm build
```

The shortcut command is:

```bash
pnpm release:check
```

For browser-auth proof with a temporary local PostgreSQL service:

```bash
pnpm test:e2e:db
```

## Known Caveats

- `apps/email` is a development preview surface; it intentionally does not have
  a production app build.
- Email/password signup requires verification. Production deployments must
  configure Resend or SMTP; local and E2E flows use the private filesystem outbox.
- Storybook build can emit bundle-size warnings. These are acceptable for a
  design-system review surface, not product runtime warnings.
- Live delivery/storage smoke checks still require real S3, Resend, or SMTP
  credentials and should be added by the project that selects those providers.
- `/ready` checks database connectivity and providers required by enabled
  production features. Live delivery/storage smoke still needs deployment credentials.
- `pnpm test:e2e:db` uses an isolated Compose project, deploys the checked-in
  migrations to its dedicated volume, and removes the volume after each run. It remains local-only until a
  project accepts the browser runtime cost in pull-request CI.
- Portable Docker image build/start/readiness is locally proven; image push and
  provider-specific hosting checks remain deployment-platform responsibilities.
- `pnpm boilerplate:init --skip-install` now removes the copied source
  lockfile. Run `pnpm install` in the generated project before using
  `--frozen-lockfile`.

## Template Scaffold Decision

Do not build executable scaffolds for `saas`, `education`, `dev-tools`,
`shopify-addon`, or `shopify-public-app` yet.

Keep the current template tracks as a typed decision catalog until a concrete
project needs one of them. These tracks describe likely add-ons, boundaries, and
what must stay out of core. They should not grow into speculative code because
each domain will probably be project-specific:

- `saas` depends on the chosen billing provider, pricing model, entitlement
  rules, and analytics events.
- `education` depends on the learning model, school policy, content structure,
  grading rules, and AI feedback workflow.
- `dev-tools` depends on the tool domain, file formats, execution model, quotas,
  and retention policy.
- `shopify-addon` depends on whether Shopify is optional connectivity for a
  SaaS product and which store workflows are actually needed.
- `shopify-public-app` depends on Shopify app framework choices, app store
  requirements, embedded UI constraints, billing model, and extensions.

The right next step for a future project is:

1. Select one template track from the catalog.
2. Write the project-specific product contract in `docs/product/*`.
3. Create story packets for the smallest real vertical slices.
4. Add only the scaffold code that the selected project can immediately validate.

## Template Work That Is Still Worth Doing

Without building domain scaffolds, it is still useful to keep the template
system lightweight and reusable:

- Keep `pnpm templates:validate` in CI.
- Keep each `templates/*/README.md` aligned with `packages/config/src/templates.ts`.
- Add a future `templates:select` helper only if project forking becomes
  repetitive enough to justify automation.
- Promote repeated patterns from real projects back into template README
  guidance or shared packages only after reuse is observed.

## Exit Criteria

This boilerplate is ready to fork when:

- `pnpm release:check` passes.
- Root `.env.example` can bootstrap local development.
- The selected project has a clear product contract and non-goals.
- Any chosen provider credentials and production deployment targets are known.
- Domain-specific template code is created only for the selected project.
