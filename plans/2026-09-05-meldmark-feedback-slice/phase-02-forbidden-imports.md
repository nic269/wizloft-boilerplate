# Optional forbidden imports in the boundary engine

Date: 2026-09-05
Phase: 02 / BP-02

Status: **COMPLETED**

Authorization: full implementation authorized and executed per plan.
Reference baseline: `8975877d44b82682c53f3c486e8b26299cffc4b9`.
Parent: [initiative plan](plan.md). Implementation complete with evidence; see reports/pm-2026-09-05-meldmark-feedback-completion.md.
## Outcome and non-goals

Let a downstream package forbid selected framework/provider imports while retaining
its existing workspace dependency allowlist. Permit explicitly named adapter files
to import a specifically exempted dependency.

Do not impose universal Prisma, Next, Hono, or provider bans on every product.
Do not add packages, change architecture layers, infer domain packages from names,
disable existing boundary checks, or introduce an orchestration-tool dependency.

## Source context

- [Boundary engine](../../scripts/boundaries/boundary-engine.ts), lines 441–445,
  skips imports that do not resolve to a workspace. External imports consequently
  have no forbidden-import check today.
- Its parser already recognizes static imports, exports, literal dynamic imports,
  require calls, and import types. Reuse that parsing surface.
- Config at lines 425–427 is parsed and cast, not runtime schema-validated.
- [Schema](../../scripts/boundaries/boundaries.schema.json) currently exposes only
  client-safe entrypoints and package rules.
- [Generator](../../scripts/boilerplate-init/generator.ts), lines 257–260, removes
  Ajv from generated manifests. A new runtime validator cannot silently assume Ajv.

Read [architecture](../../docs/ARCHITECTURE.md) and current
[boundary tests](../../scripts/boundaries/boundary-engine.test.ts) before edits.

## Design contracts

Add two optional fields, with absence equivalent to empty maps:

```json
{
  "forbiddenPackageImports": {
    "@repo/example-domain": ["@prisma/client", "next", "hono"]
  },
  "forbiddenImportExceptions": {
    "@repo/example-domain": {
      "src/adapters/postgres-repository.ts": ["@prisma/client"]
    }
  }
}
```

This is a documentation/test example, not a package to scaffold or a root default ban.

1. An import rule matches the exact specifier or descendants separated by `/`.
   `next` matches `next/server`, never `nextish`; `@scope/pkg` never matches
   `@scope/pkg-other`. A subpath rule bans that subpath and its descendants only.
2. Exception paths are exact files relative to the owning workspace, written in
   canonical POSIX form. Normalize inspected platform separators before matching.
   Reject empty/root paths, absolute paths, drive paths, backslashes in config,
   `.`/`..` segments, wildcards, directory-wide exceptions, and duplicate entries.
3. Each exception value names an existing forbidden rule exactly; it exempts only
   that rule in that one file. Reject unknown owners, missing rule references,
   malformed specifiers, wrong types, and unsupported config keys with useful errors.
   Each exception path must resolve to an existing regular source file inside the
   owning workspace; reject directories, nonexistent files and escaping symlinks.
4. Validate these contracts in executable code before walking source. The JSON
   schema remains aligned, but editor schema hints alone are insufficient.
5. Use a small dependency-free config validator inside `scripts/boundaries` and
   preserve existing accepted config behavior. Generated output still removes
   source-only Ajv; do not create a new downstream dependency for this check.
6. Run the forbidden-import check before workspace resolution can skip external
   imports. It must also apply to workspace specifiers when explicitly configured.
7. Exceptions bypass only the named forbidden-import rule. They never bypass
   client/server entrypoints, export maps, package layers, declarations, or cycles.
8. Keep this a static literal-import check. Computed specifiers and bundler alias
   resolution are outside scope; document these limits without claiming a sandbox.

## Affected files

Existing files to edit after authorization:

- `scripts/boundaries/boundary-engine.ts`: types, validation call, import check.
- `scripts/boundaries/boundary-engine.test.ts`: additive configuration and regressions.
- `scripts/boundaries/boundaries.schema.json`: optional fields and shape rules.
- `boundaries.config.json`: optional empty maps only if useful for discoverability;
  no ungrounded production bans.
- `scripts/boilerplate-init/generator.test.ts`: generated schema/engine/runtime proof.
- `docs/ARCHITECTURE.md`: contract, example, limitations, exception ownership.

Proposed new files, only where separation keeps the engine maintainable:

- `scripts/boundaries/boundary-config.ts`: executable validation and shared types.
- `scripts/boundaries/forbidden-imports.ts`: exact matching and exception resolution.

Generated output already retains `scripts/boundaries`, its schema, and root config.
Ensure new files are copied and checks run after generator removes its own scripts.
No template package, generated agent instruction, or profile flag is required.

## Implementation sequence

1. Confirm the active scope and read current engine/config/generator code.
2. Add valid/invalid config fixtures, preserving old configs without new fields.
3. Implement executable validation and align the checked-in JSON schema.
4. Integrate matching before external imports are skipped; retain all old checks.
5. Add exact-file exceptions and verify separator normalization on Windows-style
   observed file paths without broadening accepted config paths.
6. Exercise the full existing parser surface, scoped names, subpaths, lookalike
   prefixes, wrong-workspace exceptions, and combined old/new violations.
7. Generate a fresh target and run its boundary command with installed dependencies;
   exercise one forbidden-import fixture there, then remove only the fixture.
8. Review the final diff and update architecture documentation with verified behavior.

## Verification to execute later

From the repo root:

```bash
pnpm exec vitest run scripts/boundaries/boundary-engine.test.ts
pnpm exec vitest run scripts/boilerplate-init/generator.test.ts
pnpm boundaries
pnpm release:check
```

Generate a unique target with `pnpm boilerplate:init <target> --validate`, then run
its `pnpm boundaries` and `pnpm release:check`. Use harmless fixture source to
confirm an external import is rejected and its exact adapter exception succeeds.
Confirm an exception still cannot import a private export or a server-only entry
from a Client Component. The generated test cannot resolve helper code or Ajv
through the source checkout. Clean the task-owned target after recording evidence.

No database or browser proof is needed for this static checker unless implementation
unexpectedly changes runtime code; such a change requires scope review.

## Acceptance

- Existing configuration and existing violation behavior remain compatible.
- External package and subpath rules match exact boundaries, including scoped names.
- Malformed/broad exceptions fail in the executable CLI, not only in an editor.
- Exact-file exceptions cannot disable unrelated boundary rules.
- No universal framework prohibition is silently applied to generated products.
- Source and independent generated-output tests, boundaries, and release pass.

## Risks and rollback

An early return after an exception could weaken older checks; test combined violations.
Overbroad path matching could exempt an entire package; accept exact files only.
Missing runtime validator dependencies could break generated output; prove it fresh.

Rollback removes the optional fields and corresponding engine additions together;
no schema migration, provider operation, or product data change is involved.

## Completed evidence

- Source and independent generated-output tests, boundaries, and release pass (included in final source release:check green).
- Generated negative fixtures exercised; exact-file exceptions and config validation pass at runtime.
- Full profile matrix 32/32 installed (includes boundary checks post gen).
- Existing config + violation behavior backward compatible.
- No universal framework bans applied.
- See implementation report and focused generator/boundary tests for commands.

## Acceptance (evidence-backed)

- [x] Existing configuration and existing violation behavior remain compatible.
- [x] External package and subpath rules match exact boundaries, including scoped names.
- [x] Malformed/broad exceptions fail in the executable CLI, not only in an editor.
- [x] Exact-file exceptions cannot disable unrelated boundary rules.
- [x] No universal framework prohibition is silently applied to generated products.
- [x] Source and independent generated-output tests, boundaries, and release pass.
