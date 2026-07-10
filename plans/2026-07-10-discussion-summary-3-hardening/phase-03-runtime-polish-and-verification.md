# Phase 3: Runtime Polish and Verification

## Changes

- Move the docs URL into the web runtime environment.
- Render invitation mail with the shared React Email template and text fallback.
- Sanitize request IDs and always emit completion logs.
- Align pnpm and transactional-mail setup documentation.

## Validation

- Focused web, mail, API context, generator, and environment-contract tests.
- `pnpm release:check`.
- Fresh generated-project release check.
- Browser and Docker checks only when Harness capabilities are present.

