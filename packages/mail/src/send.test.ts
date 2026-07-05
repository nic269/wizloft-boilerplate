import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMailProviderStatus, sendMail } from "./send";

describe("mail provider", () => {
	beforeEach(() => {
		vi.unstubAllEnvs();
	});

	it("uses console delivery when provider credentials are absent", async () => {
		vi.stubEnv("RESEND_API_KEY", "");
		const status = getMailProviderStatus();

		await expect(sendMail({ to: "user@example.com", subject: "Hello", text: "Body" })).resolves.toMatchObject({
			provider: "console",
		});
		expect(status).toEqual({ provider: "console", configured: true, mode: "development" });
	});

	it("reports resend as configured only when a sender is present", () => {
		vi.stubEnv("RESEND_API_KEY", "test-key");
		expect(getMailProviderStatus()).toEqual({ provider: "resend", configured: false, mode: "provider" });

		vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
		expect(getMailProviderStatus()).toEqual({ provider: "resend", configured: true, mode: "provider" });
	});
});
