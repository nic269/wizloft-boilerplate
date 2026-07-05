# Design

## Domain Model

Roles remain organization-scoped. Permissions are whitelist pairs of `module` and `action` from the auth package catalog.
The Owner role receives all baseline permissions. Member remains a low-privilege role with organization, members, and
role read access.

## Application Flow

Queries:

- List roles for an organization.
- List active members for an organization.
- List recent audit logs for an organization.

Commands:

- Create a role from catalog permissions.
- Update an active membership to a role that belongs to the same organization.

Commands write product audit records.

## Interface Contract

Routes:

- `GET /api/organizations/:organizationId/roles`
- `POST /api/organizations/:organizationId/roles`
- `GET /api/organizations/:organizationId/members`
- `PATCH /api/organizations/:organizationId/members/:membershipId/role`
- `GET /api/organizations/:organizationId/audit-logs`

Authorization:

- `roles:read`
- `roles:manage`
- `members:read`
- `members:manage`
- `audit:read`

## Data Model

No migration is needed. Existing `Role`, `RolePermission`, `Membership`, and `AuditLog` tables are used.

## UI / Platform Impact

`apps/app` gains `/settings/access` for organization selection, role creation, member role assignment, and audit review.

## Observability

Role creation writes `role.created`. Member assignment writes `member.role_updated`. Audit logs are product records, not
operational logs.

## Alternatives Considered

1. Store permissions as free-form strings. Rejected because boilerplate consumers need a safe default authorization
   surface.
2. Implement full role editing/deletion now. Deferred to avoid destructive policy choices before a product needs them.

