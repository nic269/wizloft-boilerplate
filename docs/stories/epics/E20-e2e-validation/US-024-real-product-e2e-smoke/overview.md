# US-024: Real Product E2E Smoke

## Current Behavior

Playwright proves authentication and invitation acceptance against PostgreSQL,
but organization onboarding is only an incidental step in the invitation test.
There is no browser-level proof that organization lists remain tenant scoped.

## Target Behavior

- Authentication signup, protected dashboard access, and sign-out remain covered.
- Organization onboarding has a dedicated real-database browser smoke.
- Two isolated users only see organizations where they have active membership.
- Invitation creation, callback-preserving signup, acceptance, and resulting
  membership remain covered.
- One command bootstraps PostgreSQL and runs all smoke journeys on desktop and
  mobile browser projects.

## Affected Users

- Maintainers validating the boilerplate before reuse.
- Product users relying on authentication and organization isolation.
- Organization owners and invited members.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `README.md`

## Non-Goals

- Changing authentication, organization, invitation, or RBAC behavior.
- Testing every validation error or access-management operation in Playwright.
- Promoting browser E2E into CI in this story.

