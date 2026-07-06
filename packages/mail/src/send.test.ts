import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMailProviderStatus, sendMail } from "./send";

describe("mail provider", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses console delivery when provider credentials are absent", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const status = getMailProviderStatus();

    await expect(
      sendMail({ subject: "Hello", text: "Body", to: "user@example.com" })
    ).resolves.toMatchObject({
      provider: "console",
    });
    expect(status).toEqual({
      configured: true,
      mode: "development",
      provider: "console",
    });
  });

  it("reports resend as configured only when a sender is present", () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    expect(getMailProviderStatus()).toEqual({
      configured: false,
      mode: "provider",
      provider: "resend",
    });

    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    expect(getMailProviderStatus()).toEqual({
      configured: true,
      mode: "provider",
      provider: "resend",
    });
  });
});
