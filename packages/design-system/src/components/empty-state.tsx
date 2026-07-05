import type { ReactNode } from "react";
import { Card, CardContent } from "./card";

export const EmptyState = ({
	title,
	description,
	action,
}: {
	title: string;
	description?: string;
	action?: ReactNode;
}) => (
	<Card>
		<CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 p-8 text-center">
			<h2 className="text-lg font-semibold">{title}</h2>
			{description ? <p className="max-w-md text-sm text-muted-foreground">{description}</p> : null}
			{action}
		</CardContent>
	</Card>
);
