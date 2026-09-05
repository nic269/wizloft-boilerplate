# Wizloft Harness instructions

This repository is initialized with Wizloft Harness.

Canonical instructions live in this file. Agent adapter files may contain only a managed
bootstrap that points here. Do not copy these rules into AGENTS.md or CLAUDE.md.

## Command

The portable repository-local command is:

```text
node .wizloft/harness/run.mjs <Harness module argv>
```

Examples:

```text
node .wizloft/harness/run.mjs --help
node .wizloft/harness/run.mjs inspect --json
node .wizloft/harness/run.mjs authority resolve --input '{"subject":"wizloft-boilerplate:project"}'
```

This wrapper is not a second Harness CLI. It is the process boundary into the exact
project-local `@wizloft/harness-project` runtime. A future host such as `wizharness` is
optional convenience over the same `runProjectHarness` function.

## Identity

- Project subject: `wizloft-boilerplate:project`
- Harness subject: `wizloft-boilerplate:harness`
- Memory scope: `project:wizloft-boilerplate`

Default Authority and Context come from `.wizloft/PROJECT.md` and this file.
Optional `.wizloft/harness/profile.local.mjs` may add explicit repository source mappings
only.

## Runtime

Harness requires Node.js >=22.13.0. Packages resolve from `.wizloft/harness/node_modules`.
If that install is missing, restore it with:

```text
npm --prefix .wizloft/harness ci --ignore-scripts --no-audit --no-fund
```

Do not mutate the host application package manifest merely to use Harness.
