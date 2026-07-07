import { describe, expect, it } from "vitest";
import { contract } from "./contracts";
import { openApiDocument } from "./openapi";

describe("openapi document", () => {
  it("generates paths from the oRPC contract", () => {
    expect(openApiDocument.paths).toBeDefined();
    expect(openApiDocument.paths?.["/status"]?.get?.operationId).toBe(
      "status.get.rest"
    );
    expect(openApiDocument.paths?.["/rpc/status.get"]?.get?.operationId).toBe(
      "status.get.rpc"
    );
    expect(
      openApiDocument.paths?.["/api/organizations/{organizationId}/members"]
        ?.get?.operationId
    ).toBe("organizations.members.list");
  });

  it("keeps runtime routes and generated documentation on one contract", () => {
    expect(contract.organizations.create["~orpc"].route.path).toBe(
      "/api/organizations"
    );
    expect(
      openApiDocument.paths?.["/api/organizations"]?.post?.operationId
    ).toBe(contract.organizations.create["~orpc"].route.operationId);
  });

  it("documents the same error envelope returned by the Hono adapter", () => {
    const response =
      openApiDocument.paths?.["/api/organizations"]?.post?.responses?.["422"];
    expect(response).toMatchObject({
      content: {
        "application/json": {
          schema: {
            properties: {
              error: {
                required: ["code", "message"],
              },
            },
            required: ["error"],
          },
        },
      },
    });
  });
});
