export type LogLevel = "debug" | "info" | "warn" | "error";

export type LogContext = {
	requestId?: string;
	userId?: string;
	organizationId?: string;
	route?: string;
	durationMs?: number;
	[key: string]: unknown;
};

const redact = (value: LogContext): LogContext => {
	if (!value || typeof value !== "object") {
		return {};
	}

	return Object.fromEntries(
		Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
			key,
			/(secret|token|password|key|authorization)/i.test(key) ? "[redacted]" : entry,
		]),
	);
};

export const createLogger = (base: LogContext = {}) => {
	const write = (level: LogLevel, message: string, context: LogContext = {}) => {
		const payload = {
			timestamp: new Date().toISOString(),
			level,
			message,
			...redact(base),
			...redact(context),
		};

		const line = process.env.NODE_ENV === "production" ? JSON.stringify(payload) : `[${level}] ${message}`;
		const sink = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
		sink(line, process.env.NODE_ENV === "production" ? undefined : payload);
	};

	return {
		debug: (message: string, context?: LogContext) => write("debug", message, context),
		info: (message: string, context?: LogContext) => write("info", message, context),
		warn: (message: string, context?: LogContext) => write("warn", message, context),
		error: (message: string, context?: LogContext) => write("error", message, context),
		child: (context: LogContext) => createLogger({ ...base, ...context }),
	};
};

export const logger = createLogger();
