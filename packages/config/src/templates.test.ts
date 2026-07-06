import { describe, expect, it } from "vitest";
import { getTemplateTrack, templateTracks } from "./templates";

describe("template catalog", () => {
  it("keeps template slugs unique and path-aligned", () => {
    const slugs = new Set(templateTracks.map((template) => template.slug));

    expect(slugs.size).toBe(templateTracks.length);
    for (const template of templateTracks) {
      expect(template.path).toBe(`templates/${template.slug}`);
      expect(template.additions.length).toBeGreaterThan(0);
      expect(template.keepOutOfCore.length).toBeGreaterThan(0);
    }
  });

  it("looks up template tracks by slug", () => {
    expect(getTemplateTrack("base")?.name).toBe("Base");
    expect(getTemplateTrack("missing")).toBeUndefined();
  });
});
