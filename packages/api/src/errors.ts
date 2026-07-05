import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ApiErrorResponse = {
	error: {
		code: string;
		message: string;
		details?: unknown;
		requestId?: string;
	};
};

export class ApiError extends Error {
	constructor(
		public readonly code: string,
		message: string,
		public readonly status: ContentfulStatusCode = 400,
		public readonly details?: unknown,
	) {
		super(message);
	}
}
