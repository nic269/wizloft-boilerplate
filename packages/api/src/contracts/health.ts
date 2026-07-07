import { z } from "zod";
import { apiContract, emptyInputSchema } from "./base";

export const okSchema = z.object({ ok: z.literal(true) });
export const statusSchema = z.object({
  ok: z.literal(true),
  service: z.literal("api"),
  time: z.iso.datetime(),
});

const health = apiContract
  .route({
    method: "GET",
    operationId: "health.get.rest",
    path: "/health",
    summary: "Health check",
  })
  .input(emptyInputSchema)
  .output(okSchema);

const ready = apiContract
  .route({
    method: "GET",
    operationId: "ready.get.rest",
    path: "/ready",
    summary: "Readiness check",
  })
  .input(emptyInputSchema)
  .output(okSchema);

const status = apiContract
  .route({
    method: "GET",
    operationId: "status.get.rest",
    path: "/status",
    summary: "Service status",
  })
  .input(emptyInputSchema)
  .output(statusSchema);

const legacyRpc = {
  health: apiContract
    .route({
      deprecated: true,
      method: "GET",
      operationId: "health.get.rpc",
      path: "/rpc/health.get",
      summary: "RPC health.get",
    })
    .input(emptyInputSchema)
    .output(z.object({ data: okSchema })),
  ready: apiContract
    .route({
      deprecated: true,
      method: "GET",
      operationId: "ready.get.rpc",
      path: "/rpc/ready.get",
      summary: "RPC ready.get",
    })
    .input(emptyInputSchema)
    .output(z.object({ data: okSchema })),
  status: apiContract
    .route({
      deprecated: true,
      method: "GET",
      operationId: "status.get.rpc",
      path: "/rpc/status.get",
      summary: "RPC status.get",
    })
    .input(emptyInputSchema)
    .output(z.object({ data: statusSchema })),
};

export const healthContract = { health, legacyRpc, ready, status };
