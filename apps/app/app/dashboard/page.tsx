import { getCurrentSession } from "@repo/auth/session";
import { appConfig, dashboardNav } from "@repo/config";
import {
	AppShell,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Home,
	PageHeader,
	Settings,
	Users,
} from "@repo/design-system";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignOutButton } from "./sign-out-button";

export default async function DashboardPage() {
	const session = await getCurrentSession(await headers());

	if (!session) {
		redirect("/sign-in");
	}

	return (
		<AppShell
			brand={appConfig.name}
			navItems={dashboardNav.map((item) => ({
				...item,
				icon: item.href.includes("members") ? (
					<Users className="h-4 w-4" />
				) : item.href.includes("settings") ? (
					<Settings className="h-4 w-4" />
				) : (
					<Home className="h-4 w-4" />
				),
			}))}
			topbar={
				<div className="flex items-center gap-3">
					<div className="text-right text-sm">
						<div className="font-medium text-foreground">{session.user.name}</div>
						<div className="text-muted-foreground">{session.user.email}</div>
					</div>
					<SignOutButton />
				</div>
			}
		>
			<div className="space-y-6">
				<PageHeader
					title="Dashboard"
					description={`Signed in as ${session.user.email}.`}
					actions={<Button>Invite member</Button>}
				/>
				<div className="grid gap-4 md:grid-cols-3">
					<Card>
						<CardHeader>
							<CardTitle>Organizations</CardTitle>
							<CardDescription>Org-scoped roles and permissions are the default.</CardDescription>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">Ready</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>API</CardTitle>
							<CardDescription>Hono health and OpenAPI surfaces are mounted separately.</CardDescription>
						</CardHeader>
						<CardContent>
							<a className="text-sm font-medium text-blue-600" href="/status">
								Check status
							</a>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Providers</CardTitle>
							<CardDescription>Mail, storage, jobs, billing, analytics, and docs are optional.</CardDescription>
						</CardHeader>
						<CardContent className="text-2xl font-semibold">Graceful</CardContent>
					</Card>
				</div>
			</div>
		</AppShell>
	);
}
