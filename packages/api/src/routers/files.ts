import { getStorageProviderStatus } from "@repo/storage";
import { Hono } from "hono";

export const filesRouter = new Hono().get("/", (context) =>
  context.json({
    data: getStorageProviderStatus(),
    message: "Storage providers are configured through @repo/storage.",
  })
);
