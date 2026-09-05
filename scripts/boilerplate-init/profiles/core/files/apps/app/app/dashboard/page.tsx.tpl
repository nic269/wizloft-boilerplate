import { getCurrentSession } from "@repo/auth/session";
import { EmptyState, PageHeader } from "@repo/design-system";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AppShellLayout } from "../app-shell-layout";

export default async function DashboardPage() {
  const session = await getCurrentSession(await headers());
  if (!session) {
    redirect("/sign-in");
  }
  return (
    <AppShellLayout>
      <div className="space-y-6">
        <PageHeader
          description={`Signed in as ${session.user.email}.`}
          title="Dashboard"
        />
        <EmptyState
          description="Add product capabilities when a concrete domain requires them."
          title="Identity foundation ready"
        />
      </div>
    </AppShellLayout>
  );
}
