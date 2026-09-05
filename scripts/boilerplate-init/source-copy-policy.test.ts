import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  assertNoSelectedSymlinks,
  sourcePathAllowed,
} from "./source-copy-policy.ts";

const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

describe("source copy policy", () => {
  it.each([
    ".env",
    "apps/api/.env.local",
    ".omp/state.json",
    "data/local.sqlite-wal",
    "server.pid",
    "runtime.log",
    "apps/api/dist/index.cjs",
    "apps/web/.next/server.js",
    "apps/email/.react-email/index.js",
    "packages/database/tsconfig.tsbuildinfo",
  ])("excludes local runtime state: %s", (entry) => {
    expect(sourcePathAllowed({ entry, remove: [], sourceExcludes: [] })).toBe(
      false
    );
  });

  it.each([
    ".env.example",
    "packages/auth/.env.test.example",
    "db/seed.sql",
  ])("retains source contracts: %s", (entry) => {
    expect(sourcePathAllowed({ entry, remove: [], sourceExcludes: [] })).toBe(
      true
    );
  });

  it("rejects selected symlinks but ignores excluded symlinks", async () => {
    const root = await mkdtemp(join(tmpdir(), "copy-policy-"));
    roots.push(root);
    await mkdir(join(root, ".omp"));
    await writeFile(join(root, "source.ts"), "export {};");
    await symlink(join(root, "source.ts"), join(root, ".omp", "ignored-link"));
    await symlink(join(root, "source.ts"), join(root, "selected-link"));

    await expect(
      assertNoSelectedSymlinks({
        remove: [],
        sourceExcludes: [],
        sourceRoot: root,
      })
    ).rejects.toThrow("Selected generator payload contains symlink");
  });
});
