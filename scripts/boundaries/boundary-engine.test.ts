import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { checkBoundaries } from "./boundary-engine.ts";

const roots: string[] = [];

const writeJson = (path: string, value: unknown) =>
  writeFile(path, `${JSON.stringify(value, null, 2)}\n`);

const workspace = async (input: {
  dependencies?: Record<string, string>;
  exports?: Record<string, string>;
  kind: "apps" | "packages";
  name: string;
  root: string;
  source: string;
}) => {
  const slug = input.name.split("/").at(-1) ?? input.name;
  const directory = join(input.root, input.kind, slug);
  await mkdir(join(directory, "src"), { recursive: true });
  await writeJson(join(directory, "package.json"), {
    dependencies: input.dependencies,
    exports: input.exports,
    name: input.name,
  });
  await writeFile(join(directory, "src/index.ts"), input.source);
};

afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("boundary engine", () => {
  it("reports source, export, layer, client, declaration, and cycle violations", async () => {
    const root = await mkdtemp(join(tmpdir(), "boundaries-"));
    roots.push(root);
    const configPath = join(root, "boundaries.config.json");
    await writeJson(configPath, {
      packageRules: { "@repo/ui": [] },
      serverOnlyPackages: { "@repo/server": ["./client"] },
    });
    await workspace({
      kind: "apps",
      name: "@repo/app-a",
      root,
      source: 'import "@repo/app-b";\n',
    });
    await workspace({ kind: "apps", name: "@repo/app-b", root, source: "" });
    await workspace({
      dependencies: {
        "@repo/app-b": "workspace:*",
        "@repo/server": "workspace:*",
      },
      exports: { ".": "./src/index.ts" },
      kind: "packages",
      name: "@repo/ui",
      root,
      source:
        '"use client";\nimport "@repo/app-b";\nimport "@repo/server/private";\n',
    });
    await workspace({
      dependencies: { "@repo/ui": "workspace:*" },
      exports: { ".": "./src/index.ts", "./client": "./src/client.ts" },
      kind: "packages",
      name: "@repo/server",
      root,
      source: 'import "@repo/ui";\n',
    });

    const violations = await checkBoundaries({ configPath, root });
    expect(new Set(violations.map(({ code }) => code))).toEqual(
      new Set([
        "app-imports-app",
        "client-imports-server",
        "dependency-cycle",
        "layer-violation",
        "package-imports-app",
        "private-deep-import",
        "undeclared-workspace-dependency",
      ])
    );
  });

  it("accepts public client entrypoints and declared package layers", async () => {
    const root = await mkdtemp(join(tmpdir(), "boundaries-"));
    roots.push(root);
    const configPath = join(root, "boundaries.config.json");
    await writeJson(configPath, {
      packageRules: { "@repo/ui": ["@repo/server"] },
      serverOnlyPackages: { "@repo/server": ["./client"] },
    });
    await workspace({
      dependencies: { "@repo/server": "workspace:*" },
      exports: { ".": "./src/index.ts" },
      kind: "packages",
      name: "@repo/ui",
      root,
      source: '"use client";\nimport "@repo/server/client";\n',
    });
    await workspace({
      exports: { ".": "./src/index.ts", "./client": "./src/client.ts" },
      kind: "packages",
      name: "@repo/server",
      root,
      source: "",
    });

    await expect(checkBoundaries({ configPath, root })).resolves.toEqual([]);
  });
});
