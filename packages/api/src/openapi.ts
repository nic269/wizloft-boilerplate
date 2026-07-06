import { rpcContract } from "./rpc/contract";

export interface OpenApiMethod {
  operationId: string;
  responses: Record<string, unknown>;
  summary: string;
}

export interface OpenApiPathItem {
  get?: OpenApiMethod;
}

const successResponse = (description: string, schema: unknown) => ({
  content: {
    "application/json": {
      schema,
    },
  },
  description,
});

const contractPaths = Object.fromEntries(
  Object.values(rpcContract).flatMap((procedure) => [
    [
      procedure.restPath,
      {
        get: {
          operationId: `${procedure.id}.rest`,
          responses: {
            "200": successResponse(
              "Successful response",
              procedure.openapiResponse
            ),
          },
          summary: procedure.summary,
        },
      },
    ],
    [
      procedure.rpcPath,
      {
        get: {
          operationId: `${procedure.id}.rpc`,
          responses: {
            "200": successResponse("Successful RPC response", {
              properties: { data: procedure.openapiResponse },
              required: ["data"],
              type: "object",
            }),
          },
          summary: `RPC ${procedure.id}`,
        },
      },
    ],
  ])
) as Record<string, OpenApiPathItem>;

export const openApiDocument = {
  info: {
    title: "Personal SaaS Boilerplate API",
    version: "0.1.0",
  },
  openapi: "3.1.0",
  paths: contractPaths,
} as const;
