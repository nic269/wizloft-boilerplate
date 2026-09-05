import { access, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateProject } from "./generator.ts";
import { validateProfileOutput } from "./profile-output-validator.ts";
import { resolveProfile } from "./profile-resolver.ts";

const sourceRoot = resolve(import.meta.dirname, "../..");
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("profile output validation", () => {
  it("rejects a manifest dependency on a removed core workspace", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-validation-"));
    roots.push(root);
    const target = join(root, "target");
    await generateProject({
      appName: "Core Validator",
      apps: ["app", "api"],
      install: false,
      profile: "core",
      sourceRoot,
      target,
      validate: false,
    });
    const [environment, apiBase, userFlows] = await Promise.all([
      readFile(join(target, ".env.example"), "utf8"),
      readFile(join(target, "packages/api/src/contracts/base.ts"), "utf8"),
      readFile(join(target, "tests/e2e/support/user-flows.ts"), "utf8"),
    ]);
    expect(environment).toContain(
      "NEXT_PUBLIC_APP_URL=http://localhost:3000\nNEXT_PUBLIC_WEB_URL=http://localhost:3000"
    );
    expect(environment).not.toContain("NEXT_PUBLIC_DOCS_URL");
    expect(apiBase).not.toContain("INVITATION_");
    expect(userFlows).not.toContain("createOrganization");
    await expect(access(join(target, "apps/api/dist"))).rejects.toThrow();
    await expect(access(join(target, "apps/storybook"))).rejects.toThrow();

    const manifestPath = join(target, "apps/app/package.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.dependencies["@repo/access-control"] = "workspace:*";
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

    const sourceManifest = JSON.parse(
      await readFile(join(sourceRoot, "boilerplate.init.json"), "utf8")
    );
    const resolved = resolveProfile(sourceManifest, {
      apps: ["app", "api"],
      profile: "core",
    });
    await expect(validateProfileOutput({ resolved, target })).rejects.toThrow(
      "apps/app references removed workspace @repo/access-control"
    );
  });
});
