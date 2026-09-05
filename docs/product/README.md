# Product Docs

This directory holds the boilerplate's current product contracts.

When a new product behavior is accepted, keep the relevant domain contract here
small and focused rather than extending one monolithic specification.

Do not create domain files just to fill the folder. Empty structure is healthier
than invented product truth.

## Update Rule

When behavior changes:

1. Update the affected product doc.
2. Update tests and validation evidence with the implementation.
3. Record a decision if the change affects architecture, scope, risk, or a
   previously settled product rule.
