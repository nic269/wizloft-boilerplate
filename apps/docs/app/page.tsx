import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from "@repo/design-system";

const sections = [
	"Architecture",
	"Environment",
	"Authentication",
	"Organizations and RBAC",
	"Mail, storage, and jobs",
	"Deployment",
] as const;

export default function DocsPage() {
	return (
		<main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
			<PageHeader
				title="Boilerplate Docs"
				description="Code-owned docs surface for product, architecture, and handoff notes."
			/>
			<div className="grid gap-4 md:grid-cols-2">
				{sections.map((section) => (
					<Card key={section}>
						<CardHeader>
							<CardTitle>{section}</CardTitle>
							<CardDescription>Document this area as concrete stories are implemented.</CardDescription>
						</CardHeader>
						<CardContent className="text-sm text-muted-foreground">
							Content Collections or Fumadocs can replace this starter surface later.
						</CardContent>
					</Card>
				))}
			</div>
		</main>
	);
}
