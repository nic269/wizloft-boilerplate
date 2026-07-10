import { describe, expect, it } from "vitest";
import { authFeatureConfig, authMailRequired } from "./features";

describe("auth feature config", () => {
  it("requires real mail delivery for enabled auth workflows", () => {
    expect(authFeatureConfig).toEqual({
      organizationInvitations: true,
      passwordReset: true,
      requireEmailVerification: true,
    });
    expect(authMailRequired).toBe(true);
  });
});
