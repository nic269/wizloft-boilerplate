# Dev Tools Template

Planned add-ons: tool registry, file conversion jobs, upload/download flow, job progress UI, and optional public API key
model.

Use this when the product processes developer assets, files, or API-driven workflows.

Suggested additions:

- API key model and scoped token middleware.
- File upload, private download, retention, and virus-scan hooks.
- Job progress UI backed by the jobs provider contract.
- Tool registry for conversion, analysis, and export tasks.
- Rate-limit and quota boundaries for public API calls.

Keep tool-specific parsing and execution logic in this template or separate worker packages.
