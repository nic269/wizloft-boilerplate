# US-020 Strengthen Workspace Boundary Enforcement

## Status

implemented

## Lane

normal

## Product Contract

Source and generated projects must fail fast when imports or workspace
dependencies violate deployable app boundaries, public package exports,
client/server safety, or the core package layer model.

## Acceptance Criteria

- Source imports are parsed with the TypeScript AST rather than regex matching.
- Apps cannot import other app workspaces.
- Packages cannot import app workspaces.
- Workspace imports must be declared by the importing package.
- Package subpath imports must match the target package exports map.
- Client Components cannot directly import configured server-only entrypoints.
- Configured core packages can import only approved workspace package layers.
- Workspace dependency cycles fail the check.
- Rule configuration and tests remain in generated projects.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Fixture tests prove every violation code and a valid graph |
| Integration | `pnpm boundaries` passes the real workspace |
| Platform | `pnpm release:check` passes and generated projects retain the checker |

## Evidence

- Boundary fixtures cover all seven violation codes and a valid configured
  client entrypoint; the combined generator/boundary suite passed 4/4 tests.
- The AST checker passed against all current app and package source files and
  workspace manifests without exceptions.
- Generated-project tests prove the config, checker entrypoint, engine, and
  schema survive boilerplate cleanup.
- `pnpm release:check` passed template validation, Ultracite, 24-package
  typecheck/test tasks, boundary enforcement, and all eight build tasks.
