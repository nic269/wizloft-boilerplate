import { z } from "zod";

const statusResponseSchema = z.object({
  ok: z.literal(true),
  service: z.literal("api"),
  time: z.iso.datetime(),
});

const okResponseSchema = z.object({ ok: z.literal(true) });

export const rpcContract = {
  "status.get": {
    id: "status.get",
    method: "GET",
    restPath: "/status",
    rpcPath: "/rpc/status.get",
    summary: "Service status",
    response: statusResponseSchema,
    openapiResponse: {
      type: "object",
      required: ["ok", "service", "time"],
      properties: {
        ok: { type: "boolean", const: true },
        service: { type: "string", const: "api" },
        time: { type: "string", format: "date-time" },
      },
    },
  },
  "health.get": {
    id: "health.get",
    method: "GET",
    restPath: "/health",
    rpcPath: "/rpc/health.get",
    summary: "Health check",
    response: okResponseSchema,
    openapiResponse: {
      type: "object",
      required: ["ok"],
      properties: { ok: { type: "boolean", const: true } },
    },
  },
  "ready.get": {
    id: "ready.get",
    method: "GET",
    restPath: "/ready",
    rpcPath: "/rpc/ready.get",
    summary: "Readiness check",
    response: okResponseSchema,
    openapiResponse: {
      type: "object",
      required: ["ok"],
      properties: { ok: { type: "boolean", const: true } },
    },
  },
} as const;

export type RpcProcedureId = keyof typeof rpcContract;
export type RpcProcedureOutput<TProcedureId extends RpcProcedureId> = z.infer<
  (typeof rpcContract)[TProcedureId]["response"]
>;

export const isRpcProcedureId = (value: string): value is RpcProcedureId => value in rpcContract;
