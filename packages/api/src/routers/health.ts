import { Hono } from "hono";

export const healthRouter = new Hono()
	.get("/status", (context) => context.json({ ok: true, service: "api", time: new Date().toISOString() }))
	.get("/health", (context) => context.json({ ok: true }))
	.get("/ready", (context) => context.json({ ok: true }));
