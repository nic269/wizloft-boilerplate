import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { assertTarget, generateProject, loadManifest } from "./generator.ts";

const sourceRoot = resolve(import.meta.dirname, "../..");
const temporaryRoots: string[] = [];
const INVALID_MANIFEST_ERROR =
  /Invalid init manifest:.*additional properties.*requiredApps.*array.*defaultApps.*duplicate/;

const createManifestFixture = async (value: unknown) => {
  const root = await mkdtemp(join(tmpdir(), "wizloft-manifest-"));
  temporaryRoots.push(root);
  const scriptsDirectory = join(root, "scripts", "boilerplate-init");
  await mkdir(scriptsDirectory, { recursive: true });
  await Promise.all([
    writeFile(join(root, "boilerplate.init.json"), JSON.stringify(value)),
    readFile(
      join(sourceRoot, "scripts", "boilerplate-init", "manifest.schema.json"),
      "utf8"
    ).then((schema) =>
      writeFile(join(scriptsDirectory, "manifest.schema.json"), schema)
    ),
  ]);
  return root;
};

afterEach(async () => {
  await Promise.all(
    temporaryRoots
      .splice(0)
      .map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("boilerplate init", () => {
  it("rejects a target inside the source before creating it", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-target-"));
    temporaryRoots.push(root);
    const target = join(root, "generated-project");

    await expect(
      generateProject({
        appName: "Nested",
        install: false,
        sourceRoot: root,
        target,
        validate: false,
      })
    ).rejects.toThrow(
      "Target must not be inside the boilerplate source directory."
    );
    await expect(access(target)).rejects.toThrow();
  });

  it("allows sibling paths that only share the source name prefix", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-target-prefix-"));
    temporaryRoots.push(root);

    await mkdir(join(root, "source"));

    await expect(
      assertTarget(join(root, "source"), join(root, "source-copy"))
    ).resolves.toBeUndefined();
  });

  it("rejects a target nested through a symlinked ancestor", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-target-symlink-"));
    temporaryRoots.push(root);
    const source = join(root, "source");
    const sourceLink = join(root, "source-link");
    const target = join(sourceLink, "generated-project");
    await mkdir(source);

    try {
      await symlink(source, sourceLink, "dir");
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (code === "EACCES" || code === "EPERM") {
        return;
      }
      throw error;
    }

    await expect(
      generateProject({
        appName: "Symlink Nested",
        install: false,
        sourceRoot: source,
        target,
        validate: false,
      })
    ).rejects.toThrow(
      "Target must not be inside the boilerplate source directory."
    );
    await expect(access(target)).rejects.toThrow();
  });

  it("validates the init manifest with the tracked runtime schema", async () => {
    const root = await createManifestFixture({
      defaultApps: ["app", "api"],
      optionalApps: [],
      remove: [],
      requiredApps: ["app", "api"],
      sourceExcludes: [],
      validationCommands: ["pnpm check"],
      version: 1,
    });

    await expect(loadManifest(root)).resolves.toMatchObject({ version: 1 });
  });

  it("reports all invalid manifest fields before generation", async () => {
    const root = await createManifestFixture({
      defaultApps: ["app", "app"],
      optionalApps: [],
      remove: [],
      requiredApps: "app",
      sourceExcludes: [],
      unexpected: true,
      validationCommands: [],
      version: 1,
    });

    await expect(loadManifest(root)).rejects.toThrow(INVALID_MANIFEST_ERROR);
  });

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
    ) as {
      devDependencies: Record<string, string>;
      name: string;
      scripts: Record<string, string>;
    };
    expect(packageJson.name).toBe("learning-platform");
    expect(packageJson.scripts["boilerplate:init"]).toBeUndefined();
    expect(packageJson.scripts["templates:validate"]).toBeUndefined();
    expect(packageJson.devDependencies.ajv).toBeUndefined();
    expect(packageJson.scripts["release:check"]).not.toContain("templates");
    expect(packageJson.scripts.postinstall).toBe(
      "node scripts/postinstall.mjs"
    );
    await expect(access(join(target, "apps", "docs"))).rejects.toThrow();
    await expect(access(join(target, "apps", "email"))).rejects.toThrow();
    await expect(access(join(target, "docs"))).rejects.toThrow();
    await expect(access(join(target, "AGENTS.md"))).rejects.toThrow();
    await expect(access(join(target, ".codex"))).rejects.toThrow();
    await expect(
      access(join(target, "packages/config/src/templates.ts"))
    ).rejects.toThrow();
    await expect(
      access(join(target, "packages/config/src/templates.test.ts"))
    ).rejects.toThrow();
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
    const generatedReadmeContents = await readFile(
      join(target, "README.md"),
      "utf8"
    );
    expect(generatedReadmeContents).toContain("# Learning Platform");
    expect(generatedReadmeContents).toContain("pnpm db:migrate:deploy");
    expect(generatedReadmeContents).not.toContain("pnpm db:push");
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
      await readFile(join(target, "packages/config/src/features.ts"), "utf8")
    ).not.toContain("email:");
    expect(
      await readFile(join(target, "packages/config/src/index.ts"), "utf8")
    ).not.toContain("./templates");
    expect(
      await readFile(join(target, "packages/config/src/app.ts"), "utf8")
    ).not.toContain("apps/docs");
    expect(
      await readFile(join(target, "apps/web/app/page.tsx"), "utf8")
    ).toContain('appSurfaces.includes("apps/docs")');
    expect(
      await readFile(join(target, "scripts/e2e-with-db.mjs"), "utf8")
    ).toContain("learning_platform");
    expect(
      await readFile(join(target, ".github/workflows/ci.yml"), "utf8")
    ).not.toContain("templates:validate");
    const dockerIgnore = await readFile(join(target, ".dockerignore"), "utf8");
    expect(dockerIgnore).not.toContain("harness.db");
    expect(dockerIgnore).toContain("**/.data");
    expect(
      await readFile(join(target, ".repomixignore"), "utf8")
    ).not.toContain("tests/*");
    await expect(access(join(target, "pnpm-lock.yaml"))).rejects.toThrow();
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
