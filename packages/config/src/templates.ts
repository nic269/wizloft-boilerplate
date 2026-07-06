export interface TemplateTrack {
  additions: readonly string[];
  keepOutOfCore: readonly string[];
  name: string;
  path: `templates/${string}`;
  slug: string;
  summary: string;
  useWhen: string;
}

export const templateTracks = [
  {
    additions: [
      "Authentication, sessions, and same-origin auth rewrites.",
      "Organization onboarding, membership, invitations, roles, permissions, and audit logs.",
      "Hono API health, contract registry, provider status, and OpenAPI handoff.",
      "Optional mail, private storage, local jobs, design-system, docs, email previews, and Storybook examples.",
    ],
    keepOutOfCore: ["Product-specific data models.", "Provider business workflows.", "Brand assets.", "Secrets."],
    name: "Base",
    path: "templates/base",
    slug: "base",
    summary: "Reusable SaaS core with auth, organizations, RBAC, audit, API, providers, and tests.",
    useWhen: "The product only needs the reusable SaaS foundation.",
  },
  {
    additions: [
      "Billing provider adapter and typed env keys.",
      "Plan, price, subscription, entitlement, and usage models.",
      "Pricing page and customer portal entry points.",
      "Subscription webhook route with idempotent event handling.",
    ],
    keepOutOfCore: ["Provider-specific billing assumptions that not every future product needs."],
    name: "SaaS",
    path: "templates/saas",
    slug: "saas",
    summary: "Billing, pricing, entitlements, customer portal, subscription webhooks, and analytics.",
    useWhen: "The product sells recurring access to the app.",
  },
  {
    additions: [
      "Course, class, lesson, assignment, attempt, and grading models.",
      "Teacher/student roles mapped onto core RBAC.",
      "Private media storage for submissions and lesson assets.",
      "Async feedback jobs for scoring, summaries, or AI review.",
    ],
    keepOutOfCore: ["School-specific policies.", "Grading rules.", "External classroom integration behavior."],
    name: "Education",
    path: "templates/education",
    slug: "education",
    summary: "Classes, lessons, assignments, attempts, media, CMS, and AI feedback extension points.",
    useWhen: "The product manages learning workflows.",
  },
  {
    additions: [
      "API key model and scoped token middleware.",
      "File upload, private download, retention, and virus-scan hooks.",
      "Job progress UI backed by the jobs provider contract.",
      "Rate-limit and quota boundaries for public API calls.",
    ],
    keepOutOfCore: ["Tool-specific parsing logic.", "Tool-specific execution logic."],
    name: "Dev Tools",
    path: "templates/dev-tools",
    slug: "dev-tools",
    summary: "File conversion jobs, upload/download flow, job progress UI, and public API key model.",
    useWhen: "The product processes developer assets, files, or API-driven workflows.",
  },
  {
    additions: [
      "Encrypted store-token settings.",
      "Webhook HMAC verification and idempotent event records.",
      "Admin API client adapter and sync jobs.",
      "Admin-only settings UI for integration health.",
    ],
    keepOutOfCore: ["Store-specific workflows.", "Brand-specific sync rules.", "Secrets."],
    name: "Shopify Add-on",
    path: "templates/shopify-addon",
    slug: "shopify-addon",
    summary: "OAuth helpers, webhook verification, encrypted tokens, Admin API client, and sync jobs.",
    useWhen: "A future SaaS product needs Shopify integration without becoming a Shopify app.",
  },
  {
    additions: [
      "Shopify app shell and required webhooks.",
      "App Bridge or embedded app surface.",
      "Shop installation lifecycle and billing integration.",
      "Shared package reuse for auth, env, logging, storage, and jobs where compatible.",
    ],
    keepOutOfCore: ["Shopify app framework assumptions.", "Embedded-app-only UI contracts.", "Store-domain logic."],
    name: "Shopify Public App",
    path: "templates/shopify-public-app",
    slug: "shopify-public-app",
    summary: "Separate Shopify app surface that reuses shared packages without entering core.",
    useWhen: "The product should be distributed as a Shopify public app.",
  },
] as const satisfies readonly TemplateTrack[];

export const getTemplateTrack = (slug: string) => templateTracks.find((template) => template.slug === slug);
