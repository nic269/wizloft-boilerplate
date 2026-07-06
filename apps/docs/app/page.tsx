import { templateTracks } from "@repo/config/templates";
import { ArrowRight, Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@repo/design-system";

const onboardingSteps = [
  {
    title: "Start the stack",
    body: "Install dependencies, copy the aggregate root env file, start PostgreSQL, push the Prisma schema, seed baseline data, then run every app through Turbo.",
    command:
      "pnpm install -> cp .env.example .env -> docker compose up -d postgres -> pnpm db:push -> pnpm db:seed -> pnpm dev",
  },
  {
    title: "Prove the baseline",
    body: "Use the same checks locally and in CI so generated templates inherit a known-good contract.",
    command: "pnpm check -> pnpm check-types -> pnpm test -> pnpm boundaries -> pnpm build",
  },
  {
    title: "Fork a product",
    body: "Keep shared auth, env, API, storage, mail, jobs, and design-system packages in core. Move domain-specific behavior into templates or add-on packages.",
    command: "templates/base plus one optional template",
  },
] as const;

const referenceSections = [
  {
    title: "Environment",
    points: [
      "Root .env is the local development source of truth.",
      "Workspace commands load it through dotenv-cli.",
      "Packages own reusable keys.ts contracts with @t3-oss/env-core.",
      "Optional integrations disable cleanly when variables are absent.",
    ],
  },
  {
    title: "Authentication",
    points: [
      "Better Auth server code lives in packages/auth.",
      "Next clients use same-origin /api/auth rewrites from apps/app.",
      "Protected pages read server session state before rendering private UI.",
      "Email/password smoke is covered by Playwright when PostgreSQL is available.",
    ],
  },
  {
    title: "Organizations and RBAC",
    points: [
      "Organization onboarding provisions Owner role, baseline permissions, membership, and audit.",
      "Invitations use hashed tokens, exact-email acceptance, and optional mail delivery.",
      "Role changes are scoped to an organization and recorded in audit logs.",
      "The access settings screen is the reusable admin pattern for future products.",
    ],
  },
  {
    title: "API Platform",
    points: [
      "apps/api exposes Hono routes, health checks, auth, RPC-style procedures, and OpenAPI.",
      "Procedure IDs stay stable so future clients can depend on a named contract.",
      "OpenAPI paths are generated from the same registry as the runtime handlers.",
      "Strict oRPC runtime can replace the registry later if a product needs it.",
    ],
  },
  {
    title: "Providers",
    points: [
      "Mail falls back to console delivery without provider credentials.",
      "Storage supports private local, memory, and S3-compatible providers.",
      "Jobs include a local provider with idempotency, retries, and run status.",
      "Billing, analytics, CMS, and observability packages remain extension seams.",
    ],
  },
  {
    title: "Deployment",
    points: [
      "apps/* are independently deployable.",
      "Production injects env variables through the hosting platform.",
      "Use Docker plus turbo prune for narrow deployment contexts.",
      "Run database migrations before promoting app and API services.",
    ],
  },
] as const;

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-6 py-10">
      <PageHeader
        description="Code-owned handoff surface for using, extending, validating, and deploying the personal SaaS boilerplate."
        title="Boilerplate Docs"
      />
      <section className="grid gap-4 lg:grid-cols-3">
        {onboardingSteps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
              <CardDescription>{step.body}</CardDescription>
            </CardHeader>
            <CardContent>
              <code className="block rounded-md border border-border bg-muted p-3 text-muted-foreground text-xs leading-5">
                {step.command}
              </code>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {referenceSections.map((section) => (
          <Card key={section.title}>
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-muted-foreground text-sm">
                {section.points.map((point) => (
                  <li className="flex gap-2" key={point}>
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="space-y-4">
        <div>
          <h2 className="font-semibold text-xl tracking-normal">Template Tracks</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            Templates describe product-specific add-ons that can reuse core without pulling domain code into the base
            boilerplate.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {templateTracks.map((template) => (
            <div className="rounded-md border border-border bg-card p-4" key={template.slug}>
              <p className="font-mono text-muted-foreground text-xs">{template.path}</p>
              <h3 className="mt-2 font-semibold">{template.name}</h3>
              <p className="mt-1 text-muted-foreground text-sm">{template.summary}</p>
              <p className="mt-3 text-sm">{template.useWhen}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
