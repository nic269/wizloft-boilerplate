import { describe, expect, it, vi } from "vitest";
import { createLocalJobProvider } from ".";

describe("local job provider", () => {
  it("runs registered jobs and records completion", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(async () => undefined);
    provider.register({ handler, name: "email.send" });

    const { runId } = await provider.enqueue({ name: "email.send", payload: { email: "user@example.com" } });
    await provider.waitUntilIdle();

    expect(handler).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(provider.getRun(runId)).toMatchObject({ attempts: 1, status: "completed" });
  });

  it("deduplicates queued work by idempotency key", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(async () => undefined);
    provider.register({ handler, name: "report.build" });

    const first = await provider.enqueue({ idempotencyKey: "daily", name: "report.build", payload: {} });
    const second = await provider.enqueue({ idempotencyKey: "daily", name: "report.build", payload: {} });
    await provider.waitUntilIdle();

    expect(second.runId).toBe(first.runId);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("retries failed jobs and records final failure", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(() => Promise.reject(new Error("provider unavailable")));
    provider.register({ handler, name: "sync.provider", retry: { attempts: 2, delayMs: 0 } });

    const { runId } = await provider.enqueue({ name: "sync.provider", payload: {} });
    await provider.waitUntilIdle();

    expect(handler).toHaveBeenCalledTimes(2);
    expect(provider.getRun(runId)).toMatchObject({
      attempts: 2,
      error: "provider unavailable",
      status: "failed",
    });
  });
});
