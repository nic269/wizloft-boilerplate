# Overview

## Current Behavior

Mail, storage, and jobs packages exist, but their behavior is uneven. Mail can fall back to console delivery, storage has
local and memory providers but no S3-compatible implementation despite env keys and dependencies, and jobs enqueue
fire-and-forget work without visible run state.

## Target Behavior

The boilerplate exposes provider abstractions that are useful by default and degrade predictably when optional
credentials are missing:

- Mail reports console or Resend provider status and keeps console delivery available for development.
- Storage supports local, memory, and S3/R2-compatible private object storage with sanitized tenant keys.
- Jobs support a local in-process provider with run records, retry, idempotency, and testable idle waiting.
- API placeholder routes expose provider status for storage and jobs.

## Affected Users

- Developers starting a new product from the boilerplate.
- Future agents adding product-specific mail, file, or background workflows.

## Affected Product Docs

- `docs/product/boilerplate-platform.md`

## Non-Goals

- Durable database-backed job queue.
- Provider credential smoke tests against live Resend, S3, R2, or SMTP.
- Public file URLs.
- Domain-specific workflows.

