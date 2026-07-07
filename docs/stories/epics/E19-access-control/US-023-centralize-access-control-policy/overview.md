# Overview

## Status

implemented

## Current Behavior

Auth owns the permission catalog, the app duplicates its labels and pairs, and
the seed creates permission strings outside the accepted catalog.

## Target Behavior

A browser-safe package owns permission vocabulary, keys, guards, normalization,
UI defaults, and baseline role presets. Auth remains responsible for querying
memberships and enforcing permissions against the database.

## Affected Users

- Engineers extending roles and permissions in generated projects.
- Organization administrators using access settings.
- Operators seeding a new local or preview database.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`
- `docs/ARCHITECTURE.md`
- `docs/decisions/0014-central-access-control-policy.md`

## Non-Goals

- Adding, renaming, or removing accepted permission pairs.
- Changing super-admin, membership, tenant, or API authorization behavior.
- Adding billing entitlements or product-specific policy.
