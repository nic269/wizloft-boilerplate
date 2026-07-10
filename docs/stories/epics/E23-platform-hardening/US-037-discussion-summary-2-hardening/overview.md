# Overview

## Current Behavior

Auth delivery is not enforced, provider readiness is partly diagnostic,
organization and integration invariants are incomplete, job contracts overstate
their behavior, the generator trusts an unvalidated manifest, and API list and
legacy health surfaces retain provisional contracts.

## Target Behavior

The accepted discussion decisions become enforced runtime, database, generator,
and API contracts with source and generated-project proof.

## Affected Users

- SaaS users registering or accepting invitations.
- Operators deploying and probing the API.
- Developers generating and extending a new project.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/deployment.md`
- `docs/release-readiness.md`

## Non-Goals

- Provider-specific business workflows.
- Compatibility for deprecated RPC routes.
- A web UI that exposes development mail tokens.
