# US-003: Centralize Local Environment Configuration

## Intent

Use one root `.env` file for local development while preserving typed, app-owned env contracts and platform-injected production configuration.

## Acceptance Criteria

- Root and direct workspace commands load the repository root `.env`.
- Changing `DATABASE_URL` in root `.env` affects Prisma and API runtime commands.
- Hard-coded database and auth bootstrap values do not override local configuration.
- Empty optional integration values disable the integration instead of failing validation.
- Existing process variables take precedence over `.env` values.
- `NODE_ENV` remains owned by Next.js and other runtime commands.
- Package contracts use `@t3-oss/env-core`; Next apps compose them with `@t3-oss/env-nextjs`.
- `dotenv-cli` loads root `.env` for root and direct workspace commands without a custom parser or process wrapper.
