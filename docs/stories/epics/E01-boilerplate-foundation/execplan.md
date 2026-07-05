# Exec Plan

## Goal

Create the first runnable boilerplate scaffold from the supplied v2 spec while preserving generic architecture boundaries.

## Scope

In scope:

- Repo shell and tooling.
- Core packages for env, config, helpers, logger, design-system, database, auth, API, mail, storage, jobs, and optional modules.
- App surfaces for app, web, API, docs, email, and storybook.
- Generic Prisma schema and Better Auth split.
- Harness docs, decision, and validation records.

Out of scope:

- Ops Hub domain code.
- Full production sign-up/sign-in/invite browser automation.
- Real paid provider setup.

## Risk Classification

Risk flags:

- Auth.
- Authorization.
- Data model.
- Audit/security.
- External systems.
- Public contracts.
- Weak proof.
- Multi-domain.

Hard gates:

- Auth.
- Authorization.
- Audit/security.
- External provider behavior.

## Work Phases

1. Discovery.
2. Design.
3. Validation planning.
4. Implementation.
5. Verification.
6. Harness update.

## Stop Conditions

Pause for human confirmation if:

- Product behavior is ambiguous.
- Data migration or deletion risk appears.
- Validation requirements need to be weakened.
- Architecture direction changes.
