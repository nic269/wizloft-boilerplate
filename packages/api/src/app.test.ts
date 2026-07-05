import { describe, expect, it } from "vitest";
import { createApiApp } from "./app";

describe("api app", () => {
	it("serves status", async () => {
		const response = await createApiApp().request("/status");
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({ ok: true, service: "api" });
	});
});
