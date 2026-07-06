import { getCurrentSession } from "@repo/auth/session";
import { appConfig, dashboardNav } from "@repo/config";
import { AppShell, PageHeader } from "@repo/design-system";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AccessPanel } from "./access-panel";

export default async function AccessPage() {
  if (!(await getCurrentSession(await headers()))) {
    redirect("/sign-in");
  }

  return (
    <AppShell brand={appConfig.name} navItems={dashboardNav}>
      <div className="space-y-6">
        <PageHeader
          description="Manage organization roles, member assignments, and audit history."
          title="Access"
        />
        <AccessPanel />
      </div>
    </AppShell>
  );
}
