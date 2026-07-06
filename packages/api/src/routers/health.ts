import { Hono } from "hono";
import { getHealthPayload, getReadyPayload, getStatusPayload } from "../health";

export const healthRouter = new Hono()
  .get("/status", (context) => context.json(getStatusPayload()))
  .get("/health", (context) => context.json(getHealthPayload()))
  .get("/ready", (context) => context.json(getReadyPayload()));
