import { describe, expect, it } from "vitest";
import {
  type ProfileInitManifest,
  resolveProfile,
} from "./profile-resolver.ts";

const manifest: ProfileInitManifest = {
  defaultProfile: "saas",
  optionalApps: ["web", "docs", "email", "storybook"],
  profiles: {
    core: { defaultApps: ["app", "api"], packages: ["api", "auth"] },
    saas: { defaultApps: ["app", "web", "api", "email", "storybook"] },
  },
  requiredApps: ["app", "api"],
};

describe("profile resolver", () => {
  it("preserves SaaS defaults and resolves core defaults", () => {
    expect(resolveProfile(manifest, {})).toMatchObject({
      apps: ["app", "web", "api", "email", "storybook"],
      packages: null,
      profile: "saas",
    });
    expect(resolveProfile(manifest, { profile: "core" })).toMatchObject({
      apps: ["app", "api"],
      packages: ["api", "auth"],
      profile: "core",
    });
  });

  it("deduplicates explicit apps and requires app and api", () => {
    expect(
      resolveProfile(manifest, {
        apps: ["app", "api", "web", "web"],
        profile: "core",
      }).apps
    ).toEqual(["app", "api", "web"]);
    expect(() =>
      resolveProfile(manifest, { apps: ["app"], profile: "core" })
    ).toThrow("Required app surface(s) missing: api");
  });

  it("rejects unknown profiles and apps", () => {
    expect(() => resolveProfile(manifest, { profile: "custom" })).toThrow(
      "Unknown generation profile"
    );
    expect(() =>
      resolveProfile(manifest, { apps: ["app", "api", "worker"] })
    ).toThrow("Unknown app surface(s): worker");
  });
});
