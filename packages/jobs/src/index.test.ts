import { describe, expect, it, vi } from "vitest";
import { createLocalJobProvider } from ".";

describe("local job provider", () => {
  it("runs registered jobs and records completion", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(async () => undefined);
    provider.register({ name: "email.send", handler });

    const { runId } = await provider.enqueue({ name: "email.send", payload: { email: "user@example.com" } });
    await provider.waitUntilIdle();

    expect(handler).toHaveBeenCalledWith({ email: "user@example.com" });
    expect(provider.getRun(runId)).toMatchObject({ status: "completed", attempts: 1 });
  });

  it("deduplicates queued work by idempotency key", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(async () => undefined);
    provider.register({ name: "report.build", handler });

    const first = await provider.enqueue({ name: "report.build", payload: {}, idempotencyKey: "daily" });
    const second = await provider.enqueue({ name: "report.build", payload: {}, idempotencyKey: "daily" });
    await provider.waitUntilIdle();

    expect(second.runId).toBe(first.runId);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("retries failed jobs and records final failure", async () => {
    const provider = createLocalJobProvider();
    const handler = vi.fn(() => Promise.reject(new Error("provider unavailable")));
    provider.register({ name: "sync.provider", retry: { attempts: 2, delayMs: 0 }, handler });

    const { runId } = await provider.enqueue({ name: "sync.provider", payload: {} });
    await provider.waitUntilIdle();

    expect(handler).toHaveBeenCalledTimes(2);
    expect(provider.getRun(runId)).toMatchObject({
      status: "failed",
      attempts: 2,
      error: "provider unavailable",
    });
  });
});
