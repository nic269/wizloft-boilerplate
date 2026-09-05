import { describe, expect, it, vi } from "vitest";
import { createApiApp } from "./app";

vi.mock("@repo/auth/server", () => ({
  auth: { handler: vi.fn(() => new Response(null, { status: 404 })) },
}));
vi.mock("@repo/database", () => ({
  prisma: { $queryRaw: vi.fn().mockResolvedValue([{ value: 1 }]) },
}));
vi.mock("@repo/mail", () => ({
  assertMailProviderConfiguration: vi.fn(),
  getMailProviderStatus: () => ({
    configured: true,
    mode: "console",
    provider: "console",
    state: "configured",
  }),
}));

describe("core API", () => {
  it("exposes health and omits SaaS product routes", async () => {
    expect((await createApiApp().request("/health")).status).toBe(200);
    expect((await createApiApp().request("/api/organizations")).status).toBe(404);
  });
});
