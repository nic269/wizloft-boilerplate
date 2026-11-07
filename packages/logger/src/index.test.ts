import { afterEach, describe, expect, it, vi } from "vitest";
import { createLogger } from "./index";

const captureInfoLine = (context: Record<string, unknown>) => {
  vi.stubEnv("NODE_ENV", "production");
  const sink = vi.spyOn(console, "log").mockImplementation(() => undefined);
  createLogger().info("test.event", context);
  const [line] = sink.mock.calls.at(-1) ?? [];
  return JSON.parse(String(line)) as Record<string, unknown>;
};

describe("createLogger", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  it("creates child loggers", () => {
    expect(
      createLogger({ requestId: "req_1" }).child({ userId: "user_1" })
    ).toBeDefined();
  });

  it("redacts sensitive keys at any depth", () => {
    const payload = captureInfoLine({
      headers: { authorization: "Bearer abc", cookie: "session=abc" },
      providers: [{ apiKey: "key-1", name: "resend" }],
      user: { password: "hunter2", profile: { accessToken: "token-1" } },
    });

    expect(payload).toMatchObject({
      headers: { authorization: "[redacted]", cookie: "[redacted]" },
      providers: [{ apiKey: "[redacted]", name: "resend" }],
      user: {
        password: "[redacted]",
        profile: { accessToken: "[redacted]" },
      },
    });
  });

  it("keeps non-secret identifiers that merely end in key", () => {
    const payload = captureInfoLine({
      idempotencyKey: "job-1",
      objectKey: "uploads/a.png",
    });

    expect(payload).toMatchObject({
      idempotencyKey: "job-1",
      objectKey: "uploads/a.png",
    });
  });
});
