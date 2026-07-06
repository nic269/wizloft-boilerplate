import { z } from "zod";

const statusResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("api"),
  time: z.iso.datetime(),
});

const okResponseSchema = z.object({ ok: z.literal(true) });

export const rpcContract = {
  "health.get": {
    id: "health.get",
    method: "GET",
    openapiResponse: {
      properties: { ok: { const: true, type: "boolean" } },
      required: ["ok"],
      type: "object",
    },
    response: okResponseSchema,
    restPath: "/health",
    rpcPath: "/rpc/health.get",
    summary: "Health check",
  },
  "ready.get": {
    id: "ready.get",
    method: "GET",
    openapiResponse: {
      properties: { ok: { const: true, type: "boolean" } },
      required: ["ok"],
      type: "object",
    },
    response: okResponseSchema,
    restPath: "/ready",
    rpcPath: "/rpc/ready.get",
    summary: "Readiness check",
  },
  "status.get": {
    id: "status.get",
    method: "GET",
    openapiResponse: {
      properties: {
        ok: { const: true, type: "boolean" },
        service: { const: "api", type: "string" },
        time: { format: "date-time", type: "string" },
      },
      required: ["ok", "service", "time"],
      type: "object",
    },
    response: statusResponseSchema,
    restPath: "/status",
    rpcPath: "/rpc/status.get",
    summary: "Service status",
  },
} as const;

export type RpcProcedureId = keyof typeof rpcContract;
export type RpcProcedureOutput<TProcedureId extends RpcProcedureId> = z.infer<
  (typeof rpcContract)[TProcedureId]["response"]
>;

export const isRpcProcedureId = (value: string): value is RpcProcedureId => value in rpcContract;
