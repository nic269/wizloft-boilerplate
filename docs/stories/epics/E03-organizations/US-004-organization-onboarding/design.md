# US-004 Design

## Domain Model

Organization creation provisions one active membership linked to a per-organization `Owner` role. The Owner role gets
baseline organization and member permissions. Super-admin bypass remains supported by the shared permission service.

## Application Flow

1. Resolve the Better Auth session from request headers.
2. Reject anonymous requests.
3. Validate and normalize organization input.
4. Create organization, Owner role, permissions, membership, and audit log in one Prisma transaction.
5. Return only membership-scoped organization summaries.

## Interface Contract

- `GET /api/organizations` returns `{ data: OrganizationSummary[] }` for active memberships.
- `POST /api/organizations` accepts `{ name: string, slug?: string }` and returns `{ data }` with status 201.
- Unauthorized requests return the standard `UNAUTHORIZED` error envelope.
- Duplicate slugs return the standard `CONFLICT` error envelope.

## Data Model

The existing generic Organization, Role, RolePermission, Membership, and AuditLog models are sufficient. No migration
is required.

## UI / Platform Impact

The dashboard displays existing memberships and an organization creation form.

## Observability

Successful creation writes `organization.created` with the organization and actor identifiers. API request logging
continues to capture request id, route, status, and duration.

## Alternatives Considered

1. Use the Better Auth organization plugin. Deferred because the repository already owns a generic Prisma RBAC model
   and needs explicit permission and audit contracts independent of an auth vendor plugin.
2. Create the default role asynchronously. Rejected because partially provisioned organizations would be unusable.

