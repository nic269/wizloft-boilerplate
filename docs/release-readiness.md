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
| Database | Ready | Prisma package, PostgreSQL compose service, generate/push/migrate/seed/studio scripts. |
| Auth | Ready | Better Auth server/client package split, same-origin Next rewrites, email-password E2E coverage, suspended-user access enforcement, shared verification/reset email delivery. |
| Organizations and access | Ready | Organization onboarding, invitations, RBAC, member management, last-owner protection, audit log patterns. |
| API | Ready | Hono app, API package, liveness/readiness checks, provider status, RPC-style registry, OpenAPI handoff. |
| Providers | Ready as optional core | Mail, private storage, jobs, billing, analytics, CMS, observability packages disable cleanly without credentials. |
| UI system | Ready | Design-system provider, shared global tokens, app-owned CSS override seams, Storybook surface. |
| Handoff surfaces | Ready | `apps/web`, `apps/docs`, `apps/email`, `apps/storybook`. |
| Release validation | Ready | `pnpm release:check`, CI template validation, check/type/test/boundary/build ladder. |
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
- Email verification messages are sent on sign-up, but verified-email
  enforcement before sign-in is not enabled by default yet. Enable it in a
  project-specific story when the onboarding UX includes verify/resend states.
- Storybook build can emit bundle-size warnings. These are acceptable for a
  design-system review surface, not product runtime warnings.
- Live provider smoke checks for S3, Resend/SMTP, billing, analytics, and
  observability require credentials and should be added by the project that
  chooses those providers.
- `/ready` checks database connectivity only. Optional provider credentials are
  still reported as diagnostics and should get provider-specific smoke checks in
  projects that enable them.
- `pnpm test:e2e:db` is intentionally local for now. Promote it to CI only if
  pull request runtime budget allows browser E2E.
- Docker prune builds are wired, but image push/runtime health checks should be
  validated against the chosen hosting platform.
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
