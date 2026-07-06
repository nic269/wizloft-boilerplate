import { appConfig, marketingNav } from "@repo/config";
import { ArrowRight, Button } from "@repo/design-system";

export default function WebHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <a className="font-semibold text-sm" href="/">
          {appConfig.name}
        </a>
        <nav className="hidden items-center gap-6 text-muted-foreground text-sm md:flex">
          {marketingNav.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <Button
          nativeButton={false}
          render={<a href="http://localhost:3000/sign-in" />}
          size="sm"
        >
          Open app
        </Button>
      </header>
      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="space-y-6">
          <h1 className="max-w-3xl font-semibold text-5xl tracking-normal md:text-6xl">
            Personal SaaS Boilerplate
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground leading-8">
            A clean Next.js, Hono, Better Auth, Prisma, and Turborepo foundation
            for education apps, internal tools, and SaaS products.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              nativeButton={false}
              render={<a href="http://localhost:3000/sign-up" />}
            >
              Start building <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              nativeButton={false}
              render={<a href="http://localhost:3003" />}
              variant="outline"
            >
              Read docs
            </Button>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="grid gap-3 text-sm">
            {[
              "apps/app",
              "apps/web",
              "apps/api",
              "apps/docs",
              "apps/email",
              "apps/storybook",
            ].map((item) => (
              <div
                className="flex items-center justify-between rounded-md bg-muted p-3"
                key={item}
              >
                <span>{item}</span>
                <span className="text-muted-foreground">deployable</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
