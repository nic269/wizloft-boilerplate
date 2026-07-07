# US-021 Tighten Turbo Environment Contracts

## Status

implemented

## Lane

normal

## Product Contract

Turbo tasks must receive only declared environment variables, and cached tasks
must hash every environment value that can affect their behavior or output.
Root `.env` remains the local source of truth and direct workspace commands
continue to load it through `dotenv-cli`.

## Acceptance Criteria

- `turbo.json` uses strict environment mode.
- Private `.env` is not a global file dependency.
- Checked-in env examples remain global configuration inputs.
- Build, dev, test, and database tasks declare their environment contracts.
- Global runtime switches are limited to `NODE_ENV` and
  `SKIP_ENV_VALIDATION`.
- A test prevents `.env.example` and task env declarations from drifting.
- Generated projects retain the strict contract.

## Validation

| Layer | Expected proof |
| --- | --- |
| Unit | Turbo/env drift and generated-project retention tests |
| Integration | Source type, test, and database commands run in strict mode |
| Platform | `pnpm release:check` passes all production builds |

## Evidence

- Turbo/env and generated-project retention tests passed 4/4.
- Strict mode completed all 24 package typecheck and test tasks with the root
  `.env` workflow intact.
- Database generation, API tests, optional-provider tests, and all Next.js and
  Storybook builds received their declared environment contracts.
- Sandboxed build reached Turbopack but could not bind its CSS helper port;
  escalated `pnpm release:check` passed all eight build tasks.
