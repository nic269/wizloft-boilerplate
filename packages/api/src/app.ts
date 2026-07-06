import { auth } from "@repo/auth/server";
import { Hono } from "hono";
import { requestContext } from "./context";
import { ApiError, type ApiErrorResponse } from "./errors";
import { openApiDocument } from "./openapi";
import { filesRouter } from "./routers/files";
import { healthRouter } from "./routers/health";
import { invitationsRouter } from "./routers/invitations";
import { jobsRouter } from "./routers/jobs";
import { organizationsRouter } from "./routers/organizations";
import { rpcRouter } from "./rpc/router";

export const createApiApp = () => {
  const app = new Hono();

  app.use("*", requestContext);
  app.route("/", healthRouter);
  app.get("/openapi.json", (context) => context.json(openApiDocument));
  app.get("/docs/api", (context) => context.html("<html><body><pre>/openapi.json</pre></body></html>"));
  app.route("/rpc", rpcRouter);

  app.on(["GET", "POST"], "/api/auth/*", (context) => auth.handler(context.req.raw));
  app.route("/api/organizations", organizationsRouter);
  app.route("/api/invitations", invitationsRouter);
  app.route("/api/files", filesRouter);
  app.route("/api/jobs", jobsRouter);

  app.notFound((context) =>
    context.json<ApiErrorResponse>(
      {
        error: {
          code: "NOT_FOUND",
          message: "Route not found.",
          requestId: context.get("requestId"),
        },
      },
      404,
    ),
  );

  app.onError((error, context) => {
    const apiError = error instanceof ApiError ? error : new ApiError("INTERNAL_SERVER_ERROR", error.message, 500);
    context.get("logger").error(apiError.message, { code: apiError.code, details: apiError.details });

    return context.json<ApiErrorResponse>(
      {
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
          requestId: context.get("requestId"),
        },
      },
      apiError.status,
    );
  });

  return app;
};

export type ApiApp = ReturnType<typeof createApiApp>;
