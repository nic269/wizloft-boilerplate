# Design

## Domain Model

- The seeded system `Owner` role is an ownership boundary, not only a permission
  bundle.
- An Owner-boundary mutation is a move into or out of that role.
- Auth flags are compile-time product capabilities whose false state disables
  matching runtime behavior.

## Application Flow

- Member-role changes run at Serializable isolation and retry Prisma `P2034`
  conflicts at most three times.
- The same transaction resolves actor authority, target roles, last-Owner
  protection, update, and audit evidence.
- Invitation listing and acceptance persist expired state before returning it.

## Interface Contract

- Disabled feature endpoints retain stable contracts and return `404`.
- Permission inputs are exact catalog pairs rather than independent strings.
- Invitation and membership status outputs are constrained enums/literals.
- Invalid client request IDs are replaced with server-generated UUIDs.

## Data Model

- `IntegrationConnection.organizationId` references `Organization.id` with
  `ON DELETE CASCADE` through a forward migration.
- Migration deploy is the baseline for fresh databases; `db:push` remains a
  documented disposable-prototype tool.

## UI / Platform Impact

- Disabled auth features hide their pages, links, and invitation controls.
- Docs navigation is composed by `apps/web` from selected surfaces and
  `NEXT_PUBLIC_DOCS_URL`.

## Observability

- Request completion logs run in `finally`, use sanitized request IDs, and
  retain detailed error logs.
- Successful role changes and invitations preserve existing audit behavior.

## Alternatives Considered

1. Database advisory locks were rejected in favor of Prisma-supported
   Serializable retry semantics.
2. Independent permission module/action enums were rejected because they admit
   invalid cross-products.
3. `SetNull` integration ownership was rejected because it can turn tenant
   configuration into global configuration.

