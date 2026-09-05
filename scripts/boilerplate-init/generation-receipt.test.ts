import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import { afterEach, describe, expect, it } from "vitest";
import {
  digestGeneratedSource,
  readSourceIdentity,
  stableSourceIdentity,
} from "./generation-receipt.ts";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

const createRoot = async () => {
  const root = await mkdtemp(join(tmpdir(), "generation-receipt-"));
  roots.push(root);
  await mkdir(join(root, "src"));
  await writeFile(join(root, "src/index.ts"), "export const value = 1;\n");
  await writeFile(join(root, ".env.example"), "SAFE=value\n");
  return root;
};

describe("generation receipt", () => {
  it("produces a root-independent digest and excludes local state", async () => {
    const left = await createRoot();
    const right = await createRoot();
    await writeFile(join(left, ".env"), "SECRET=left\n");
    await writeFile(join(right, ".env"), "SECRET=right\n");
    await writeFile(join(left, "pnpm-lock.yaml"), "left\n");
    await writeFile(join(right, "pnpm-lock.yaml"), "right\n");

    await expect(digestGeneratedSource(left)).resolves.toEqual(
      await digestGeneratedSource(right)
    );
    await writeFile(join(right, "src/index.ts"), "export const value = 2;\n");
    expect((await digestGeneratedSource(left)).digest).not.toBe(
      (await digestGeneratedSource(right)).digest
    );
  });

  it("reports clean and dirty Git checkout identity without remotes", async () => {
    const root = await createRoot();
    const runGit = (args: string[]) =>
      spawnSync("git", args, { cwd: root, encoding: "utf8" });
    runGit(["init"]);
    runGit(["add", "."]);
    runGit([
      "-c",
      "user.name=Receipt Test",
      "-c",
      "user.email=receipt@example.invalid",
      "commit",
      "-m",
      "fixture",
    ]);

    expect(readSourceIdentity(root)).toMatchObject({
      dirty: false,
      kind: "git-checkout",
      metadataState: "available",
    });
    await writeFile(join(root, "untracked.txt"), "dirty\n");
    expect(readSourceIdentity(root).dirty).toBe(true);
  });

  it("clears source identity when observations change", () => {
    const before = {
      commit: "a".repeat(40),
      dirty: false,
      kind: "git-checkout" as const,
      metadataState: "available" as const,
      tree: "b".repeat(40),
    };
    expect(stableSourceIdentity(before, { ...before, dirty: true })).toEqual({
      commit: null,
      dirty: null,
      kind: "git-checkout",
      metadataState: "unavailable",
      tree: null,
    });
  });

  it.each([
    {
      commit: "a".repeat(40),
      dirty: false,
      kind: "directory",
      metadataState: "not-git",
      tree: null,
    },
    {
      commit: null,
      dirty: true,
      kind: "directory",
      metadataState: "git-unavailable",
      tree: null,
    },
    {
      commit: null,
      dirty: false,
      kind: "directory",
      metadataState: "unborn",
      tree: null,
    },
    {
      commit: null,
      dirty: false,
      kind: "git-checkout",
      metadataState: "unavailable",
      tree: null,
    },
  ])("rejects contradictory source metadata: $metadataState", async (source) => {
    const schema = JSON.parse(
      await readFile(
        join(import.meta.dirname, "generation-receipt.schema.json"),
        "utf8"
      )
    );
    const validate = new Ajv2020({ strict: true }).compile(schema);
    const receipt = {
      generatedAt: "2026-09-05T00:00:00.000Z",
      generation: {
        installRequested: false,
        validationRequested: false,
      },
      generator: { name: "wizloft-boilerplate-init", version: "0.1.0" },
      schemaVersion: 1,
      selection: { apps: ["app", "api"], profile: "core" },
      snapshot: {
        algorithm: "sha256",
        digest: "a".repeat(64),
        fileCount: 1,
        format: "path-content-v1",
        scope: "generated-source-before-install",
      },
      source,
      toolchain: { nodeRange: ">=24", packageManager: "pnpm@11.23.0" },
    };

    expect(validate(receipt)).toBe(false);
  });
});
