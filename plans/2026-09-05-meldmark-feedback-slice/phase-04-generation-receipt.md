# Phase 04 — BP-05: Generation Receipt

Date: 2026-09-05
Status: **DESIGNED / NOT IMPLEMENTED**
Dependency: Phase 03's copy/hygiene contract. Profiles are not required: before BP-04, the resolved profile is always saas.
Context: [plan](plan.md), [generator](../../scripts/boilerplate-init/generator.ts), [init manifest](../../boilerplate.init.json).

## Outcome and non-goals

Every successful new target contains a project-owned `boilerplate.receipt.json` describing how its initial source snapshot was generated. It is passive metadata: downstream builds, releases and application startup never depend on the receipt or the source repository.

No governance seed, authority/status files, remote discovery, telemetry, Git commit/tag, dependency pinning campaign or automatic receipt updates after product edits.

## Receipt v1 contract

Use the following shape; the JSON below is a type sketch, not emitted example data:

```text
schemaVersion: 1
generator:
  name: "wizloft-boilerplate-init"
  version: string                 # source package.json version
generatedAt: string               # UTC ISO-8601
source:
  kind: "git-checkout" | "directory"
  commit: string | null
  tree: string | null             # HEAD tree, never called working-tree content
  dirty: boolean | null
  metadataState: "available" | "not-git" | "git-unavailable" | "unborn" | "unavailable"
selection:
  profile: "saas" | "core"
  apps: string[]                 # resolved app names, deterministic order
toolchain:
  nodeRange: string              # source engines.node
  packageManager: string         # exact source packageManager, e.g. pnpm@11.23.0
generation:
  installRequested: boolean
  validationRequested: boolean
snapshot:
  algorithm: "sha256"
  format: "path-content-v1"
  scope: "generated-source-before-install"
  fileCount: integer
  digest: string                 # 64 lowercase hex characters
```

No absolute paths, target names derived from home directories, usernames, Git remotes, environment values, machine IDs, dependency cache locations or actual secret-bearing command lines. Deliberately omit display name and free-form CLI args; resolved profile/apps are sufficient here. No capabilities array until such an API exists.

`generator.version` is a generator/source package version, not the manifest or receipt schema version. A dirty source may differ from that released version; source metadata and output digest disclose the distinction. `validationRequested` records intent, not success or a release-readiness certificate.

The source-only receipt JSON schema rejects additional fields and invalid combinations. For example, absent Git identity does not serialize empty strings or a fabricated SHA; `dirty: null` is unknown, never clean.

## Source identity behavior

| Source | Receipt behavior |
| --- | --- |
| Git repository rooted at canonical sourceRoot, HEAD available | Read HEAD commit/tree with fixed Git arguments; dirty from tracked and untracked status, without recording names. |
| Dirty source | Generation remains allowed; record dirty=true. Do not silently report the HEAD tree as copied content. |
| Source directory inside an unrelated parent Git repo | Treat as directory unless canonical Git top-level equals sourceRoot. Never attribute the parent's commit to a packed generator. |
| No Git repository / unpacked archive | kind=directory, commit/tree/dirty=null, state=not-git. No network lookup. |
| Git executable unavailable | Null identity with git-unavailable; generation still works. |
| Git repository without HEAD | kind=git-checkout, null commit/tree, dirty as available, state=unborn. |
| Other metadata-read failure | Unknown fields null, state=unavailable; print a concise non-secret warning, continue using output digest. |

Read Git metadata before and after generating source files. If HEAD or observed cleanliness changes, clear commit/tree/dirty and use unavailable; do not attribute the result to a stable revision. This is a best-effort metadata check, not filesystem locking. The digest records the actual generated file bytes regardless of source concurrency.

Use argument arrays, fixed commands and sourceRoot as cwd. Do not interpolate user text into shell code. No git fetch, remote URL, user config or environment inspection is needed.

## Snapshot digest

Compute after profile selection/rewrites/branding/common ignore generation and removal of the source lockfile when install is skipped, but **before** installation/build and local `.env` creation. Enumerate actual generated regular files under the Phase 03 policy; symlinks are already rejected for selected payload.

Exclude the receipt itself, all lockfiles, local env/data/tool state and build/test/cache output. `.env.example`, `.env.test.example` and other deliberately generated examples are included. Include tests, CI, migration files, scripts, README and SPEC: they are part of the generated source contract.

Sort repository-relative POSIX paths by byte order. Feed each UTF-8 path and raw file content to SHA-256 using unsigned 64-bit big-endian byte-length prefixes for path and content, with no timestamp or absolute path. Record fileCount. File permissions are outside path-content-v1; do not claim executable-mode or complete filesystem identity.

This checksum identifies a source snapshot, not an installed dependency tree. The current skip-install path removes the source lockfile and a later install resolves dependencies. No claim of identical dependency resolution across time or machines. A source-equivalent generation should have the same digest even at a different target root or time, provided branding inputs are identical.

Write the receipt once inside the generator's existing target-ownership try/cleanup boundary. A failure to compute/validate/write it is a generation failure; failed install/validation follows current owned-target cleanup behavior. Do not leave a partial success marker.

The receipt is initially tracked by the generated project; copying it elsewhere is not a validation mechanism. It remains an origin record after later code changes and is never automatically rewritten by release checks.

## Files and implementation

| File | Action |
| --- | --- |
| `scripts/boilerplate-init/generation-receipt.ts` | New pure shape/digest helpers and narrowly scoped local Git metadata reader. |
| `scripts/boilerplate-init/generation-receipt.schema.json` | New strict schema, kept source-only. |
| `scripts/boilerplate-init/generation-receipt.test.ts` | New deterministic/identity/error tests. |
| `scripts/boilerplate-init/generator.ts` | Integrate after generated source finalization; render brief receipt explanation in README. |
| `scripts/boilerplate-init/generator.test.ts` | Assert emitted receipt, cleanup and independent target behavior. |
| `boilerplate.init.json` | Exclude any old source receipt from copying; do not carry another generation's identity forward. |
| `docs/product/boilerplate-platform.md`, `docs/release-readiness.md` | Document passive receipt and its limits after implementation. |

Sequence: define schema and hash framing; implement metadata fallbacks; integrate output lifecycle; test fixtures; generate/install a fresh target; run source release gate. BP-04 later supplies the selected profile/apps through the same receipt input, without reading profile state from the target at runtime.

## Verification and acceptance

- Focused: `pnpm exec vitest run scripts/boilerplate-init/generation-receipt.test.ts scripts/boilerplate-init/generator.test.ts`.
- Fake source fixtures cover clean Git, tracked/untracked dirty changes, unborn Git, no Git, nested unrelated parent repo, missing Git executable and metadata failure. Temporary Git fixtures use test-only local identity; never mutate user Git config.
- Same bytes/options yield the same digest despite changed output root/time; changing a path/content changes it. Excluded env/cache/lockfile changes do not. Receipt changes alone cannot affect its own digest.
- Schema tests reject secret-bearing extra properties, invalid digests, unknown profiles and inconsistent nullable identity. Use artificial sentinels only.
- Generate once with skip-install and once with install/validate; metadata describes options accurately, and failed generation leaves no owned target.
- Run generated `pnpm release:check` with no receipt consumer, no Git requirement and no access to source tooling. Removing receipt from a disposable copy must not prevent build/release.
- Source `pnpm release:check` once on final state. See [validation matrix](validation-matrix.md).

## Risks and rollback

Primary risk is overclaiming provenance. HEAD is only a reference; actual output bytes have their own digest. Dependency versions and permissions remain explicitly outside the digest contract. Avoid unbounded Git logging/output in the reader.

Rollback removes generator receipt integration/schema/tests and docs. Existing emitted receipts are passive; no application or database migration is necessary. Do not delete receipts in unrelated generated products.
