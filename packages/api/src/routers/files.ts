import { Hono } from "hono";

export const filesRouter = new Hono().get("/", (context) =>
	context.json({
		data: [],
		message: "Storage providers are configured through @repo/storage.",
	}),
);
