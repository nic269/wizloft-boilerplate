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
  description,
  content: {
    "application/json": {
      schema,
    },
  },
});

const contractPaths = Object.fromEntries(
  Object.values(rpcContract).flatMap((procedure) => [
    [
      procedure.restPath,
      {
        get: {
          operationId: `${procedure.id}.rest`,
          summary: procedure.summary,
          responses: {
            "200": successResponse("Successful response", procedure.openapiResponse),
          },
        },
      },
    ],
    [
      procedure.rpcPath,
      {
        get: {
          operationId: `${procedure.id}.rpc`,
          summary: `RPC ${procedure.id}`,
          responses: {
            "200": successResponse("Successful RPC response", {
              type: "object",
              required: ["data"],
              properties: { data: procedure.openapiResponse },
            }),
          },
        },
      },
    ],
  ]),
) as Record<string, OpenApiPathItem>;

export const openApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "Personal SaaS Boilerplate API",
    version: "0.1.0",
  },
  paths: contractPaths,
} as const;
