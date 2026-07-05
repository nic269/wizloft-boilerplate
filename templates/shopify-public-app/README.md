# Shopify Public App Template

Planned as a separate official Shopify app surface that reuses shared packages from this boilerplate where appropriate.

Use this when the product is distributed as a Shopify public app rather than a SaaS app with a Shopify add-on.

Suggested additions:

- Shopify app framework entrypoint and extension folders.
- App Bridge and embedded admin surface.
- Billing flow that follows Shopify app billing requirements.
- Webhook processing, shop lifecycle events, and uninstall cleanup.
- Shared package imports only where boundaries stay generic.

This should remain a separate app template so Shopify rules do not shape the base boilerplate.
