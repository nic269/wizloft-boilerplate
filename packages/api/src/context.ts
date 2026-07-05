import { createLogger } from "@repo/logger";
import type { Context, Next } from "hono";

declare module "hono" {
	interface ContextVariableMap {
		requestId: string;
		logger: ReturnType<typeof createLogger>;
	}
}

export const requestContext = async (context: Context, next: Next) => {
	const requestId = context.req.header("x-request-id") ?? crypto.randomUUID();
	const startedAt = performance.now();

	context.set("requestId", requestId);
	context.set("logger", createLogger({ requestId, route: context.req.path }));
	context.header("x-request-id", requestId);

	await next();

	context.get("logger").info("api.request", {
		durationMs: Math.round(performance.now() - startedAt),
		statusCode: context.res.status,
	});
};
