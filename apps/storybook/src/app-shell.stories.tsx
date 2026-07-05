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
	Users,
} from "@repo/design-system";
import type { Meta, StoryObj } from "@storybook/react";

const meta = {
	title: "Design System/App Shell",
	parameters: {
		layout: "fullscreen",
	},
} satisfies Meta;

export default meta;

export const ProductWorkspace: StoryObj<typeof meta> = {
	render: () => (
		<AppShell
			brand="Wizloft"
			navItems={[
				{ label: "Dashboard", href: "#dashboard", icon: <Home className="h-4 w-4" /> },
				{ label: "Members", href: "#members", icon: <Users className="h-4 w-4" /> },
				{ label: "Settings", href: "#settings", icon: <Settings className="h-4 w-4" /> },
			]}
			topbar={
				<>
					<p className="text-sm font-medium">Acme Workspace</p>
					<Button size="sm">Invite member</Button>
				</>
			}
		>
			<div className="grid gap-4 lg:grid-cols-3">
				{["Members", "Invites", "Audit events"].map((label, index) => (
					<Card key={label}>
						<CardHeader>
							<CardTitle>{label}</CardTitle>
							<CardDescription>Reusable account administration summary.</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-3xl font-semibold">{[12, 3, 48][index]}</p>
						</CardContent>
					</Card>
				))}
			</div>
		</AppShell>
	),
};
