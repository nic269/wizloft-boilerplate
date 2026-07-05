import type { ReactNode } from "react";
import { cn } from "../lib/cn";

export type AppShellNavItem = {
	label: string;
	href: string;
	icon?: ReactNode;
};

export const AppShell = ({
	children,
	navItems,
	brand = "SaaS",
	sidebar,
	topbar,
	className,
}: {
	children: ReactNode;
	navItems?: readonly AppShellNavItem[];
	brand?: string;
	sidebar?: ReactNode;
	topbar?: ReactNode;
	className?: string;
}) => (
	<div className={cn("min-h-screen bg-background text-foreground", className)}>
		<div className="grid min-h-screen md:grid-cols-[260px_1fr]">
			<aside className="hidden border-r border-border bg-muted/30 md:block">
				<div className="flex h-16 items-center border-b border-border px-6 text-sm font-semibold">{brand}</div>
				<nav className="space-y-1 p-3">
					{navItems?.map((item) => (
						<a
							className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
							href={item.href}
							key={item.href}
						>
							{item.icon}
							{item.label}
						</a>
					))}
				</nav>
				{sidebar}
			</aside>
			<main>
				<header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-8">{topbar}</header>
				<div className="p-4 md:p-8">{children}</div>
			</main>
		</div>
	</div>
);
