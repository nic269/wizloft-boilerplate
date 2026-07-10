# Discussion Summary 4 Safety Boundaries

Status: complete

## Goal

Close the filesystem, error-disclosure, provider-readiness, configuration, mail-header, and workspace-surface gaps accepted from `plans/discussion-summary-4.md`.

## Phases

1. Add durable Harness and decision records.
2. Harden generator and runtime/config boundaries.
3. Add focused regression coverage and align product documentation.
4. Run focused tests, the release ladder, and independent review.
5. Record final Harness evidence and trace.

## Dependencies

- Existing generator manifest and generated-project tests.
- Existing API error envelope and request logging.
- Existing mail provider and readiness contracts.

## Acceptance Criteria

- Generator rejects targets equal to, inside, or containing the source tree.
- Unknown API failures never expose exception messages to clients.
- Caller-controlled mail headers reject CR/LF at the provider boundary.
- Local jobs are explicitly ephemeral and not a required base feature.
- Organizations are represented as core behavior, not a false feature switch.
- Marketing describes all `appSurfaces` as workspace surfaces.
- Focused tests and `pnpm release:check` pass.

## Artifacts

- [Story packet](../../docs/stories/epics/E23-platform-hardening/US-039-generator-runtime-safety-boundaries/overview.md)
- [Decision](../../docs/decisions/0021-generator-runtime-safety-boundaries.md)
