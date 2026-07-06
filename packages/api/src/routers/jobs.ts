import { getJobProviderStatus } from "@repo/jobs";
import { Hono } from "hono";

export const jobsRouter = new Hono().get("/", (context) =>
  context.json({
    data: getJobProviderStatus(),
    message: "Job providers are configured through @repo/jobs.",
  })
);
