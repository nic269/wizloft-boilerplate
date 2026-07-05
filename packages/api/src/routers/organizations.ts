import { prisma } from "@repo/database";
import { Hono } from "hono";

export const organizationsRouter = new Hono().get("/", async (context) => {
	const organizations = await prisma.organization.findMany({
		select: { id: true, name: true, slug: true },
		orderBy: { createdAt: "asc" },
	});

	return context.json({ data: organizations });
});
