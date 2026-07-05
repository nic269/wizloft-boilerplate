# Validation

## Automated

- `pnpm check`
- `pnpm check-types`
- `pnpm test`
- `pnpm build`
- `pnpm --filter @repo/database generate`

## Runtime

- `dotenv-cli` read `DATABASE_URL` as `localhost:5434/personal_saas_boilerplate` from the current root `.env`.
- A process-level `DATABASE_URL` override remained authoritative over `.env`.
- `pnpm --filter @repo/api-app dev` started on port 3002 and `/health` returned successfully.
- `pnpm build` passed all eight build tasks with `NODE_ENV` controlled by each runtime command.
- The auth keys regression test proves empty optional provider credentials resolve to `undefined`.
