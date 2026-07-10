# US-034: Harden Provider Runtime Configuration

## Current Behavior

Absent and partially configured providers both degrade to console or local
storage, so a production typo can silently send mail nowhere or persist files
on an ephemeral container disk.

## Target Behavior

- Absent integrations remain optional.
- Provider diagnostics distinguish disabled, configured, and misconfigured.
- Resend, SMTP, S3, and R2 require complete production configuration.
- The production API exits before listening when a selected provider is broken.

## Affected Users

- Deployment operators and maintainers.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/release-readiness.md`

## Non-Goals

- Connecting to live provider accounts without project credentials.
- Making optional providers part of database readiness.
