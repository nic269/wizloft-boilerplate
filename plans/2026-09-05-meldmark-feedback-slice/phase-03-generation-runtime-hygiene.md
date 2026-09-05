# Generation, migration preflight, and E2E hygiene

Date: 2026-09-05
Phase: 03 / BP-03

Status: **DESIGNED / NOT IMPLEMENTED**

Authorization: documentation planning only; implementation requires a new-session request.
Reference baseline: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
Parent: [initiative plan](plan.md). All proof below is work for a future session.

## Outcome and non-goals

Generate independent projects without source-local secrets/runtime material; make root
dev startup refuse an unready migration state; make E2E own its database and servers.
Preserve explicit migration deployment and the existing isolated cleanup boundary.

No tool installation, Orca/OMP requirement, bootstrap command, profile implementation,
automatic migration, `db:push`, user-process termination, or migration-history rewrite.
Do not hide all downstream tool configuration because some tool files are local state.

## Source context

- [Generator](../../scripts/boilerplate-init/generator.ts), lines 379–399, filters
  copy paths using exact excluded segments and removed paths. Generated ignores do
  not govern that copy. [Manifest](../../boilerplate.init.json) excludes `.env`, but
  has no `.env.*` pattern and no `.omp`, `.agentkit`, or `.wizloft` state contract.
- Generated `.gitignore` currently covers only `.env` and `.data` for local data;
  generated Docker ignore already handles `.env.*` with an example exception.
- Root [dev script](../../package.json) starts Turbo directly. Existing database
  migration deployment is explicit in [database scripts](../../packages/database/package.json).
- Installed local Prisma is 7.8.0: `packages/database/node_modules/.bin/prisma`
  exists, and its CLI source includes `prisma migrate status`. This was inspected,
  not executed; status exit behavior still needs runtime proof.
- [E2E runner](../../scripts/e2e-with-db.mjs), lines 87–91, lets inherited values
  override local defaults; [Playwright](../../playwright.config.ts) honors reuse.
  The runner already uses its own Compose project and finally-cleanup.
- [Compose](../../docker-compose.yml) already defines a PostgreSQL healthcheck;
  the runner currently waits only for a TCP connection.

## Design contracts

### Source-copy safety and downstream ignores are separate

1. Filter before copying. Keep source root/target ancestry protections and manifest
   validation. Existing exact `sourceExcludes` entries keep their current meaning;
   add a small explicit path policy for sensitive patterns instead of pretending
   the current exact-segment list supports globs.
2. Exclude dotenv files at every selected depth except explicitly tracked example
   contracts such as `.env.example` and `.env.test.example`. Never infer safety just
   because a file is tracked. Generated `.env` is still created from the example.
3. Exclude source-owned `.omp`, `.agentkit`, `.wizloft`, Harness database/runtime,
   build/dependency/cache directories, local database files/sidecars, logs and PIDs.
   Enumerate exact patterns with harmless fixture evidence; preserve SQL migrations,
   seeds, source fixtures, example env contracts, and normal application files.
4. Reject symlinks in the selected copy payload before writing a target. Excluded
   links are skipped without reading targets. Do not dereference into excluded or
   external paths; no generated absolute or source-dependent links are permitted.
   Cover internal, escaping, and excluded symlink fixtures and platform equivalents.
5. Generated Git exclusions cover generic env/data/cache/log/PID artifacts; do not
   add blanket tool-brand directories to Git ignores. Tools installed later own
   their runtime/config Git policy. Generated Docker/Repomix exclusions may omit
   source tool roots entirely because application build/review does not need them.
   Portable config created later remains visible to Git; no tool-specific config
   discovery or bootstrap dependency is introduced by this phase.
6. Source-generation exclusion does not mean deleting user-owned downstream config.
   No updater or postinstall cleanup may remove it. Add no tool runtime/config by default.

### Check-only root development preflight

1. Add `db:migrate:status` at database and root levels, using existing local Prisma
   and dotenv conventions. Root `dev` runs it successfully before `turbo run dev`.
2. Use `prisma migrate status` as the candidate existing check. Prove nonzero exit for
   pending, failed, unreachable, and uninitialized states on disposable databases.
   If its installed behavior misses a state, add a bounded read-only check; never
   substitute a mutating deploy command to make the acceptance pass.
3. Failure explains how to inspect configuration/state and explicitly run
   `pnpm db:migrate:deploy` for pending/uninitialized migrations. Failed migrations
   need inspection and repair; do not advise blind deployment as universal recovery.
4. Preflight never applies migrations or changes data. Preserve inherited environment
   precedence and dotenv loading. Do not print credentials in custom diagnostics.
5. Direct workspace `dev` remains a low-level command whose caller owns preflight.
   Document this distinction in source and generated README. E2E already deploys its
   own fresh database before invoking workspace servers.

### Isolated E2E lifecycle

1. Merge inherited env first, then pin runner-owned service URLs, database URL,
   selected PostgreSQL port and `PLAYWRIGHT_REUSE_SERVER=false`. Pin the test mail
   transport with `MAIL_PROVIDER=console` and allocate a unique task-owned
   `MAIL_OUTBOX_DIR`, passed consistently to servers and browser helpers.
   Do not inherit an enabled real SMTP/Resend transport. Keep unrelated legitimate
   settings and default-secret behavior compatible; never copy actual credentials
   into test artifacts. Cleanup removes only this run's outbox.
2. Use Compose health waiting with a bounded timeout, grounded in the installed
   Compose CLI's supported flags. Document the minimum supported version or produce
   an actionable unsupported-version error; never fall back to unbounded waiting.
3. Preserve unique task-owned project naming and `down --volumes --remove-orphans`
   for that project only. Preserve the primary test error when cleanup also fails.
4. Occupied fixed app/API ports fail clearly. Do not kill or attach to existing
   servers. Fresh Playwright servers remain responsible for their own lifecycle.
5. Prove cleanup on success, command/readiness failure, and supported interruption.
   Add bounded signal handling if needed; do not claim cleanup after an uncatchable kill.

## Affected files

Existing: `boilerplate.init.json`; `scripts/boilerplate-init/generator.ts` and
`generator.test.ts`; `package.json`; `packages/database/package.json`;
`scripts/e2e-with-db.mjs`; `tests/e2e/support/user-flows.ts`;
`README.md`; `docs/release-readiness.md`;
`docs/product/boilerplate-platform.md`. Read each document before updating it.

Proposed: `scripts/boilerplate-init/source-copy-policy.ts` and its test;
`scripts/check-dev-migrations.mjs` if actionable preflight needs a wrapper;
`scripts/check-dev-migrations.test.ts`; `scripts/e2e-with-db.test.ts`.
Keep entrypoint scripts import-safe or extract only the policy helpers tests need.

Conditional: `scripts/boilerplate-init/manifest.schema.json` only if manifest shape
changes; `docker-compose.yml`/`playwright.config.ts` only for a proven lifecycle need.
Generated output must retain any new dev-preflight helper and status scripts;
generator-only copy helpers are removed with the generator. Update generated README,
ignore literals, and script fixtures explicitly. No template/profile behavior changes.

## Implementation sequence

1. Confirm authorized scope/baseline and read current generation/runtime contracts.
2. Build synthetic copy fixtures containing only fake env/database/log/tool bytes;
   add symlink fixtures. Never use real secrets or inspect user runtime contents.
3. Implement pre-copy exclusion/link validation, then downstream ignore rules.
4. Add check-only migration status/startup, proving each database state before
   wiring root `dev`. Confirm no long-running service starts after failed checks.
5. Pin E2E-owned env after inheritance; replace TCP-only waiting with bounded health.
6. Verify normal/error/interruption cleanup and unrelated-resource preservation.
7. Generate and validate a temporary default project, including migration startup
   and container runtime behavior; update truthful source/generated documentation.

## Verification to execute later

```bash
pnpm exec vitest run scripts/boilerplate-init/generator.test.ts scripts/boilerplate-init/source-copy-policy.test.ts
pnpm exec vitest run scripts/check-dev-migrations.test.ts scripts/e2e-with-db.test.ts
pnpm db:migrate:status
pnpm test:e2e:db
pnpm docker:validate
pnpm release:check
```

Commands naming new files apply only after implementation. Status fixtures must use
explicit task-owned database URLs: fresh/uninitialized, migrated, pending, failed,
and unreachable. Record database state before/after to prove preflight is read-only.
Explicitly deploy into a fresh fixture and prove preflight then permits root dev;
capture startup/cleanup evidence, not just a mocked command argument assertion.

Generate a unique target using `pnpm boilerplate:init <target> --validate`, then run
its own release, migration-status state checks, E2E database runner, and Docker smoke.
Assert excluded fake bytes never reached the target, examples survived, selected
symlinks fail before target mutation, and generated Git/build-context/packing rules
exclude local fixture artifacts while generic future tool config stays Git-visible.
Inject inherited wrong URLs/reuse=true and prove runner-owned values win.
Inject an inherited real-mail provider selector with fake credentials and prove
the runner still selects console/outbox without any external delivery attempt.

## Acceptance, risks, and rollback

- Copy protection and downstream ignore protection each have independent proof.
- Generated output has no source-local secret/runtime/link dependencies.
- Root dev is check-only; all non-ready states fail before servers start.
- Fresh E2E uses healthy task-owned PostgreSQL and pinned local service endpoints.
- Success/failure/interruption cleanup never removes unrelated processes or data.
- Fresh generated runtime/container proof and source release pass at final state.

Broad exclusions can hide portable configuration or legitimate fixtures; use explicit
contracts and negative tests. Compose version drift and Prisma status exit behavior
need local runtime verification. Rollback is a focused revert of scripts/policies/docs;
no application data/migration rollback, downstream deletion, or tool reset is required.

Unresolved evidence: actual Prisma status state matrix and supported Compose health
flags remain unverified in this planning session. Tool-specific config contracts are
outside scope and are not prerequisites for implementing this phase.
