# 0020 Protected Organization Owner Boundary

Date: 2026-07-10

## Status

Accepted

## Context

`members:manage` allows Admin or custom roles to assign any role, including the
system Owner role. The last-Owner count also has a concurrent write-skew window
under default transaction isolation.

## Decision

Only an active system Owner or active super admin may move a membership into or
out of the seeded system Owner role. The mutation resolves actor authority,
last-Owner protection, update, and audit inside a Serializable transaction with
at most three retries for Prisma write conflicts.

## Alternatives Considered

1. Let Admin assign Owner. Rejected because it makes `members:manage` an
   implicit ownership-escalation capability.
2. Add a new transfer-ownership permission. Deferred until a dedicated transfer
   workflow exists.

## Consequences

Positive:

- Organization ownership cannot be self-escalated by an Admin.
- Concurrent demotions preserve at least one active Owner.

Tradeoffs:

- Owner changes can return a retry-exhausted conflict under contention.
- Super admins remain an explicit platform recovery boundary.

## Follow-Up

- Add a dedicated ownership-transfer workflow only when product UX requires it.

