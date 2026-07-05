import { Hono } from "hono";

export const jobsRouter = new Hono().get("/", (context) =>
	context.json({
		data: [],
		message: "Job providers are configured through @repo/jobs.",
	}),
);
