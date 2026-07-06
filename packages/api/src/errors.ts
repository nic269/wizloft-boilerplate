import type { ContentfulStatusCode } from "hono/utils/http-status";

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
    requestId?: string;
  };
}

export class ApiError extends Error {
  readonly code: string;
  readonly details?: unknown;
  readonly status: ContentfulStatusCode;

  constructor(
    code: string,
    message: string,
    status: ContentfulStatusCode = 400,
    details?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}
