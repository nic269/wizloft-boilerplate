export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  durationMs?: number;
  requestId?: string;
  route?: string;
  userId?: string;
  [key: string]: unknown;
}

const REDACTED_KEY_PATTERN =
  /(secret|token|password|passwd|authorization|cookie|credential|api[-_]?key|private[-_]?key|access[-_]?key)/i;
const MAX_REDACT_DEPTH = 6;

const redactValue = (value: unknown, depth: number): unknown => {
  if (value === null || typeof value !== "object" || value instanceof Date) {
    return value;
  }
  if (value instanceof Error) {
    return { message: value.message, name: value.name };
  }
  if (depth >= MAX_REDACT_DEPTH) {
    return "[truncated]";
  }
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => [
      key,
      REDACTED_KEY_PATTERN.test(key)
        ? "[redacted]"
        : redactValue(entry, depth + 1),
    ])
  );
};

const redact = (value: LogContext): LogContext => {
  if (!value || typeof value !== "object") {
    return {};
  }

  return redactValue(value, 0) as LogContext;
};

const getSink = (level: LogLevel) => {
  if (level === "error") {
    return console.error;
  }

  if (level === "warn") {
    return console.warn;
  }

  return console.log;
};

export const createLogger = (base: LogContext = {}) => {
  const write = (
    level: LogLevel,
    message: string,
    context: LogContext = {}
  ) => {
    const payload = {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...redact(base),
      ...redact(context),
    };

    const line =
      process.env.NODE_ENV === "production"
        ? JSON.stringify(payload)
        : `[${level}] ${message}`;
    const sink = getSink(level);
    sink(line, process.env.NODE_ENV === "production" ? undefined : payload);
  };

  return {
    child: (context: LogContext) => createLogger({ ...base, ...context }),
    debug: (message: string, context?: LogContext) =>
      write("debug", message, context),
    error: (message: string, context?: LogContext) =>
      write("error", message, context),
    info: (message: string, context?: LogContext) =>
      write("info", message, context),
    warn: (message: string, context?: LogContext) =>
      write("warn", message, context),
  };
};

export const logger = createLogger();
