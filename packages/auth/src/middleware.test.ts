import { describe, expect, it } from "vitest";
import { createAuthGuard } from "./middleware";

const guard = createAuthGuard({
  protectedPaths: ["/dashboard", "/settings"],
  signIn: "/sign-in",
});

describe("createAuthGuard", () => {
  it("redirects protected routes without a Better Auth session cookie", () => {
    const request = new Request("http://localhost:3000/dashboard");
    const response = guard(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/sign-in?callbackUrl=%2Fdashboard"
    );
  });

  it("protects every configured prefix and keeps the return path", () => {
    const request = new Request(
      "http://localhost:3000/settings/members?tab=pending"
    );
    const response = guard(request);

    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.pathname).toBe("/sign-in");
    expect(location.searchParams.get("callbackUrl")).toBe(
      "/settings/members?tab=pending"
    );
  });

  it("does not treat lookalike paths as protected", () => {
    const response = guard(new Request("http://localhost:3000/settingsx"));

    expect(response.status).toBe(200);
  });

  it("allows protected routes with a development session cookie", () => {
    const request = new Request("http://localhost:3000/dashboard", {
      headers: { cookie: "better-auth.session_token=session-token" },
    });
    const response = guard(request);

    expect(response.status).toBe(200);
  });

  it("allows protected routes with a secure production session cookie", () => {
    const request = new Request("https://app.example.com/settings", {
      headers: { cookie: "__Secure-better-auth.session_token=session-token" },
    });
    const response = guard(request);

    expect(response.status).toBe(200);
  });
});
