import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { ORPCError, onError, ValidationError } from "@orpc/server";
import { auth } from "@repo/auth/server";
import { Hono } from "hono";
import { z } from "zod";
import { requestContext } from "./context";
import { ApiError, type ApiErrorResponse } from "./errors";
import { openApiDocument } from "./openapi";
import { router } from "./routers";

const orpcHandler = new OpenAPIHandler(router, {
  clientInterceptors: [
    onError((error) => {
      if (
        error instanceof ORPCError &&
        error.code === "BAD_REQUEST" &&
        error.cause instanceof ValidationError
      ) {
        const zodError = new z.ZodError(
          error.cause.issues as z.core.$ZodIssue[]
        );
        throw new ApiError(
          "VALIDATION_ERROR",
          "Invalid request details.",
          422,
          z.flattenError(zodError),
          { cause: error.cause }
        );
      }
    }),
  ],
  customErrorResponseBodyEncoder: (error) => ({
    error: {
      code: error.code,
      ...(error.data === undefined ? {} : { details: error.data }),
      message: error.message,
    },
  }),
});

export const createApiApp = () => {
  const app = new Hono();

  app.use("*", requestContext);
  app.get("/openapi.json", (context) => context.json(openApiDocument));
  app.get("/docs/api", (context) =>
    context.html("<html><body><pre>/openapi.json</pre></body></html>")
  );
  app.on(["GET", "POST"], "/api/auth/*", (context) =>
    auth.handler(context.req.raw)
  );
  app.use("*", async (context, next) => {
    const { matched, response } = await orpcHandler.handle(context.req.raw, {
      context: {
        headers: context.req.raw.headers,
        logger: context.get("logger"),
        requestId: context.get("requestId"),
      },
    });

    if (matched) {
      return context.newResponse(response.body, response);
    }
    await next();
  });

  app.notFound((context) =>
    context.json<ApiErrorResponse>(
      {
        error: {
          code: context.req.path.startsWith("/rpc/")
            ? "RPC_NOT_FOUND"
            : "NOT_FOUND",
          message: context.req.path.startsWith("/rpc/")
            ? "RPC procedure not found."
            : "Route not found.",
          requestId: context.get("requestId"),
        },
      },
      404
    )
  );

  app.onError((error, context) => {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError("INTERNAL_SERVER_ERROR", error.message, 500);
    context.get("logger").error(apiError.message, {
      code: apiError.code,
      details: apiError.details,
    });

    return context.json<ApiErrorResponse>(
      {
        error: {
          code: apiError.code,
          details: apiError.details,
          message: apiError.message,
          requestId: context.get("requestId"),
        },
      },
      apiError.status as 500
    );
  });

  return app;
};

export type ApiApp = ReturnType<typeof createApiApp>;
