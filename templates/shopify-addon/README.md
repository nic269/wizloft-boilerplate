# Shopify Addon Template

Planned add-ons: Shopify OAuth helpers, webhook verification, token encryption, Admin GraphQL client, shop connection
model, and sync job hooks.

Use this when a non-Shopify app needs optional Shopify connectivity.

Suggested additions:

- Shop connection model scoped to an organization.
- OAuth callback, webhook verification, and token encryption helpers.
- Admin GraphQL client wrapper with logging and retry boundaries.
- Sync jobs using the generic jobs package.
- Admin settings UI for connection status and credential rotation.

Keep store-specific workflow rules out of core and out of this template's shared helpers.
