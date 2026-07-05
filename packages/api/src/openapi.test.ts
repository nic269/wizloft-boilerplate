import { describe, expect, it } from "vitest";
import { openApiDocument } from "./openapi";
import { rpcContract } from "./rpc/contract";

describe("openapi document", () => {
	it("publishes REST and RPC paths from the contract registry", () => {
		for (const procedure of Object.values(rpcContract)) {
			expect(openApiDocument.paths[procedure.restPath]?.get?.summary).toBe(procedure.summary);
			expect(openApiDocument.paths[procedure.rpcPath]?.get?.summary).toContain(procedure.id);
		}
	});

	it("keeps operation ids stable for generated clients", () => {
		expect(openApiDocument.paths["/status"]?.get?.operationId).toBe("status.get.rest");
		expect(openApiDocument.paths["/rpc/status.get"]?.get?.operationId).toBe("status.get.rpc");
	});
});
