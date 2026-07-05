import { appConfig, marketingNav } from "@repo/config";
import { ArrowRight, Button } from "@repo/design-system";

export default function WebHomePage() {
	return (
		<main className="min-h-screen bg-background text-foreground">
			<header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
				<a className="text-sm font-semibold" href="/">
					{appConfig.name}
				</a>
				<nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
					{marketingNav.map((item) => (
						<a href={item.href} key={item.href}>
							{item.label}
						</a>
					))}
				</nav>
				<Button asChild size="sm">
					<a href="http://localhost:3000/sign-in">Open app</a>
				</Button>
			</header>
			<section className="mx-auto grid max-w-6xl gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] md:items-center">
				<div className="space-y-6">
					<h1 className="max-w-3xl text-5xl font-semibold tracking-normal md:text-6xl">Personal SaaS Boilerplate</h1>
					<p className="max-w-2xl text-lg leading-8 text-muted-foreground">
						A clean Next.js, Hono, Better Auth, Prisma, and Turborepo foundation for education apps, internal tools, and
						SaaS products.
					</p>
					<div className="flex flex-wrap gap-3">
						<Button asChild>
							<a href="http://localhost:3000/sign-up">
								Start building <ArrowRight className="h-4 w-4" />
							</a>
						</Button>
						<Button asChild variant="outline">
							<a href="http://localhost:3003">Read docs</a>
						</Button>
					</div>
				</div>
				<div className="rounded-lg border border-border bg-card p-6 shadow-sm">
					<div className="grid gap-3 text-sm">
						{["apps/app", "apps/web", "apps/api", "apps/docs", "apps/email", "apps/storybook"].map((item) => (
							<div className="flex items-center justify-between rounded-md bg-muted p-3" key={item}>
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
