# US-024 Design

## Domain Model

The tests exercise existing users, organizations, memberships, roles, and
invitations. No domain or persistence contract changes.

## Application Flow

1. Create unique users through the public signup UI.
2. Prove the authenticated dashboard and sign-out transition.
3. Create organizations from two isolated browser contexts and prove each
   membership-scoped list excludes the other user's organization.
4. Create an invitation as an owner, follow the returned acceptance URL in an
   isolated context, sign up with the exact invited email, and accept access.

## Interface Contract

Tests use accessible UI roles, labels, placeholders, and public routes. They do
not import server services or query Prisma directly.

## Data Model

No schema changes. Every run uses collision-resistant emails and organization
names; persisted smoke data lives only in the disposable E2E database.

## UI / Platform Impact

No production UI changes. Playwright runs the same journeys under Desktop
Chrome and Pixel 7 profiles.

## Observability

Playwright retains traces on first retry and writes failure artifacts under
`test-results`.

## Alternatives Considered

1. Assert tenant scope through API calls. Rejected as the primary proof because
   it would skip the browser, same-origin rewrite, client, and rendering path.
2. Keep organization creation only inside invitation E2E. Rejected because an
   invitation failure would obscure the independent onboarding/isolation
   contract.

