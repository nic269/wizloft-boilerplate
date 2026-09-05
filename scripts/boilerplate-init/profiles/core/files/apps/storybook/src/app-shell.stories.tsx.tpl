import {
  AppShell,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Home,
  Settings,
} from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
  parameters: {
    layout: "fullscreen",
  },
  title: "Design System/App Shell",
} satisfies Meta;

export default meta;

export const IdentityWorkspace: StoryObj<typeof meta> = {
  render: () => (
    <AppShell
      brand="Wizloft"
      navItems={[
        {
          href: "#dashboard",
          icon: <Home className="h-4 w-4" />,
          label: "Dashboard",
        },
        {
          href: "#settings",
          icon: <Settings className="h-4 w-4" />,
          label: "Settings",
        },
      ]}
      topbar={<Button size="sm">Sign out</Button>}
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {[
          ["Session", "Active"],
          ["Email verification", "Verified"],
        ].map(([label, value]) => (
          <Card key={label}>
            <CardHeader>
              <CardTitle>{label}</CardTitle>
              <CardDescription>Current identity status.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  ),
};
