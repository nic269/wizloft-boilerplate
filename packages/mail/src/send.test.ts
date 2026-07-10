import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  assertMailProviderConfiguration,
  getMailProviderStatus,
  MailConfigurationError,
  sendMail,
} from "./send";

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
      configured: false,
      mode: "development",
      provider: "console",
      state: "disabled",
    });
  });

  it("reports resend as configured only when a sender is present", () => {
    vi.stubEnv("RESEND_API_KEY", "test-key");
    expect(getMailProviderStatus()).toEqual({
      configured: false,
      message: "resend mail configuration is missing: RESEND_FROM_EMAIL.",
      mode: "provider",
      provider: "resend",
      state: "misconfigured",
    });

    vi.stubEnv("RESEND_FROM_EMAIL", "noreply@example.com");
    expect(getMailProviderStatus()).toEqual({
      configured: true,
      mode: "provider",
      provider: "resend",
      state: "configured",
    });
  });

  it("fails fast on partial resend configuration in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("RESEND_API_KEY", "test-key");
    vi.stubEnv("RESEND_FROM_EMAIL", "");

    expect(() => assertMailProviderConfiguration()).toThrow(
      MailConfigurationError
    );
  });

  it("reports complete smtp configuration", () => {
    vi.stubEnv("MAIL_PROVIDER", "smtp");
    vi.stubEnv("SMTP_URL", "smtp://user:password@localhost:1025");
    vi.stubEnv("SMTP_FROM_EMAIL", "noreply@example.com");

    expect(getMailProviderStatus()).toEqual({
      configured: true,
      mode: "provider",
      provider: "smtp",
      state: "configured",
    });
  });
});
