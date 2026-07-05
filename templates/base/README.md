# Base Template

Includes auth, database, design-system, app shell, organizations, invitations, roles, audit logs, console mail, local
storage, local jobs, Hono health API, typed env, logger, and tests.

Use this when the product only needs the reusable SaaS foundation.

Keep in base:

- Authentication, sessions, and same-origin auth rewrites.
- Organization onboarding, membership, invitations, roles, permissions, and audit log patterns.
- Hono API health, contract registry, provider status, and OpenAPI handoff.
- Optional mail, private storage, and local jobs providers.
- Design-system primitives, app shell, docs, email previews, and Storybook examples.

Keep out of base:

- Product-specific data models.
- Provider business workflows.
- Brand assets.
- Secrets or customer data.
