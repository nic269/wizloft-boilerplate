import { getCurrentSession } from "@repo/auth/session";
import { appConfig, dashboardNav } from "@repo/config";
import {
  AppShell,
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
import { OrganizationsPanel } from "./organizations-panel";
import { SignOutButton } from "./sign-out-button";

const getDashboardNavIcon = (href: string) => {
  if (href.includes("members")) {
    return <Users className="h-4 w-4" />;
  }

  if (href.includes("settings")) {
    return <Settings className="h-4 w-4" />;
  }

  return <Home className="h-4 w-4" />;
};

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
        icon: getDashboardNavIcon(item.href),
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
        <PageHeader description={`Signed in as ${session.user.email}.`} title="Dashboard" />
        <div className="grid gap-4 md:grid-cols-3">
          <OrganizationsPanel />
          <Card>
            <CardHeader>
              <CardTitle>API</CardTitle>
              <CardDescription>Hono health and OpenAPI surfaces are mounted separately.</CardDescription>
            </CardHeader>
            <CardContent>
              <a className="font-medium text-blue-600 text-sm" href="/status">
                Check status
              </a>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Providers</CardTitle>
              <CardDescription>Mail, storage, jobs, billing, analytics, and docs are optional.</CardDescription>
            </CardHeader>
            <CardContent className="font-semibold text-2xl">Graceful</CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
