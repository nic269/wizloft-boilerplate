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

## Agent work protocol

For every non-trivial repository task, use one stable, non-empty correlation ID for the complete
task. If initialization happened during the current agent session, start a new session first so
the selected adapter instructions are loaded.

Before editing:

1. Run `inspect --json`.
2. Resolve Authority for `wizloft-boilerplate:project` and `wizloft-boilerplate:harness`.
3. Resolve Context for `wizloft-boilerplate:project`.

After completing the work:

1. Run the repository-native verification required by the task.
2. Run `validation run` with the same correlation ID and every changed project-relative path.
   This creates persisted Evidence and Events for configured Harness validators; it does not replace
   repository-native tests.
3. Use `memory remember` only for verified reusable learning. Do not store routine task summaries,
   transcripts, unverified guesses, or repository authority as Memory. Use `state: "active"` only
   when the learning has been checked against current repository authority; otherwise keep the
   default candidate state. Provenance must identify the task correlation ID.

`.wizloft/harness/local/` is created on the first Memory or Event write. A task that produces no
Validation Evidence and no reusable learning may leave no local state.

## Runtime

Harness requires Node.js >=22.13.0. Packages resolve from `.wizloft/harness/node_modules`.
If that install is missing, restore it with:

```text
npm --prefix .wizloft/harness ci --ignore-scripts --no-audit --no-fund
```

Do not mutate the host application package manifest merely to use Harness.
