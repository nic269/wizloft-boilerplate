import { appConfig, dashboardNav } from "@repo/config";
import { AppShell, EmptyState, PageHeader } from "@repo/design-system";

export default function SettingsPage() {
  return (
    <AppShell brand={appConfig.name} navItems={dashboardNav}>
      <div className="space-y-6">
        <PageHeader
          description="Project-specific settings belong in app feature folders or templates."
          title="Settings"
        />
        <EmptyState
          description="Add concrete settings as future product stories require them."
          title="No settings yet"
        />
      </div>
    </AppShell>
  );
}
