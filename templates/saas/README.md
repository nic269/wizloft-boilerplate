# SaaS Template

Planned add-ons: billing, plans, entitlements, pricing page, customer portal, subscription webhooks, and analytics.

Use this when the product sells recurring access to the app.

Suggested additions:

- Billing provider adapter and typed env keys.
- Plan, price, subscription, entitlement, and usage models.
- Pricing page and customer portal entry points.
- Subscription webhook route with idempotent event handling.
- Analytics adapter for activation, conversion, and retention events.

Do not put provider-specific billing assumptions into core unless every future product needs them.
