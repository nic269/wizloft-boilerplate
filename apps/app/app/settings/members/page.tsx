import { getCurrentSession } from "@repo/auth/session";
import { appConfig, dashboardNav } from "@repo/config";
import { AppShell, PageHeader } from "@repo/design-system";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { MembersPanel } from "./members-panel";

export default async function MembersPage() {
	if (!(await getCurrentSession(await headers()))) redirect("/sign-in");

	return (
		<AppShell brand={appConfig.name} navItems={dashboardNav}>
			<div className="space-y-6">
				<PageHeader title="Members" description="Invite collaborators and manage pending access." />
				<MembersPanel />
			</div>
		</AppShell>
	);
}
