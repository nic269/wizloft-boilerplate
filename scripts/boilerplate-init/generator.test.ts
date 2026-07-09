import { access, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateProject } from "./generator.ts";

const sourceRoot = resolve(import.meta.dirname, "../..");
const temporaryRoots: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("boilerplate init", () => {
  it("generates a clean renamed project with selected apps", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-init-"));
    temporaryRoots.push(root);
    const target = join(root, "learning-platform");

    await generateProject({
      appName: "Learning Platform",
      apps: ["app", "api", "web"],
      install: false,
      sourceRoot,
      target,
      validate: false,
    });

    const packageJson = JSON.parse(
      await readFile(join(target, "package.json"), "utf8")
    ) as { name: string; scripts: Record<string, string> };
    expect(packageJson.name).toBe("learning-platform");
    expect(packageJson.scripts["boilerplate:init"]).toBeUndefined();
    expect(packageJson.scripts["templates:validate"]).toBeUndefined();
    expect(packageJson.scripts["release:check"]).not.toContain("templates");
    expect(packageJson.scripts.postinstall).toBe(
      "node scripts/postinstall.mjs"
    );
    await expect(access(join(target, "apps", "docs"))).rejects.toThrow();
    await expect(access(join(target, "apps", "email"))).rejects.toThrow();
    await expect(access(join(target, "docs"))).rejects.toThrow();
    await expect(access(join(target, "AGENTS.md"))).rejects.toThrow();
    await expect(access(join(target, ".codex"))).rejects.toThrow();
    await expect(access(join(target, "packages", "env"))).rejects.toThrow();
    await expect(
      access(join(target, "scripts", "README.md"))
    ).rejects.toThrow();
    await expect(
      access(join(target, "scripts", "check-boundaries.ts"))
    ).resolves.toBeUndefined();
    await expect(
      access(join(target, "scripts", "postinstall.mjs"))
    ).resolves.toBeUndefined();
    await expect(
      access(join(target, "scripts", "boundaries", "boundary-engine.ts"))
    ).resolves.toBeUndefined();
    await expect(
      access(join(target, "boundaries.config.json"))
    ).resolves.toBeUndefined();
    expect(await readFile(join(target, "README.md"), "utf8")).toContain(
      "# Learning Platform"
    );
    expect(await readFile(join(target, "SPEC.md"), "utf8")).not.toContain(
      "apps/docs"
    );
    expect(await readFile(join(target, ".env"), "utf8")).toContain(
      "learning_platform"
    );
    expect(
      await readFile(join(target, "packages/config/src/app.ts"), "utf8")
    ).toContain('  "apps/web",');
    expect(
      await readFile(join(target, "scripts/e2e-with-db.mjs"), "utf8")
    ).toContain("learning_platform");
    expect(
      await readFile(join(target, ".github/workflows/ci.yml"), "utf8")
    ).not.toContain("templates:validate");
    const turbo = JSON.parse(
      await readFile(join(target, "turbo.json"), "utf8")
    ) as { envMode: string; globalDependencies: string[] };
    expect(turbo.envMode).toBe("strict");
    expect(turbo.globalDependencies).not.toContain(".env");
  }, 15_000);

  it("rejects removal of required app surfaces", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-init-"));
    temporaryRoots.push(root);
    await expect(
      generateProject({
        appName: "Broken",
        apps: ["web"],
        install: false,
        sourceRoot,
        target: join(root, "broken"),
        validate: false,
      })
    ).rejects.toThrow("Required app surface(s) missing: app, api");
  });
});
