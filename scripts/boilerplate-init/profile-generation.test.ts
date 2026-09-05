import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateProject } from "./generator.ts";

const sourceRoot = resolve(import.meta.dirname, "../..");
const roots: string[] = [];
afterEach(async () => {
  await Promise.all(
    roots.splice(0).map((root) => rm(root, { force: true, recursive: true }))
  );
});

const optionalApps = ["web", "docs", "email", "storybook"] as const;
const appSets: string[][] = [[]];
for (const app of optionalApps) {
  const existingSetCount = appSets.length;
  for (let index = 0; index < existingSetCount; index += 1) {
    appSets.push([...(appSets[index] ?? []), app]);
  }
}

describe("profile generation", () => {
  it("generates every supported app subset for SaaS and core", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-matrix-"));
    roots.push(root);
    for (const profile of ["saas", "core"] as const) {
      for (const [index, optional] of appSets.entries()) {
        const apps = ["app", "api", ...optional];
        const target = join(root, `${profile}-${index}`);
        const result = await generateProject({
          appName: `${profile} ${index}`,
          apps,
          install: false,
          profile,
          sourceRoot,
          target,
          validate: false,
        });
        expect(result.profile).toBe(profile);
        const receipt = JSON.parse(
          await readFile(join(target, "boilerplate.receipt.json"), "utf8")
        ) as { selection: { apps: string[]; profile: string } };
        expect(receipt.selection).toEqual({ apps, profile });
      }
    }
  }, 60_000);

  it("keeps omitted profile equivalent to explicit SaaS", async () => {
    const root = await mkdtemp(join(tmpdir(), "profile-default-"));
    roots.push(root);
    const implicitTarget = join(root, "implicit", "same-project");
    const explicitTarget = join(root, "explicit", "same-project");
    await Promise.all([
      mkdir(join(root, "implicit")),
      mkdir(join(root, "explicit")),
    ]);

    await generateProject({
      appName: "Same Project",
      install: false,
      sourceRoot,
      target: implicitTarget,
      validate: false,
    });
    await generateProject({
      appName: "Same Project",
      install: false,
      profile: "saas",
      sourceRoot,
      target: explicitTarget,
      validate: false,
    });

    const receipts = await Promise.all(
      [implicitTarget, explicitTarget].map((target) =>
        readFile(join(target, "boilerplate.receipt.json"), "utf8").then(
          (contents) =>
            JSON.parse(contents) as {
              snapshot: { digest: string; fileCount: number };
            }
        )
      )
    );
    expect(receipts[0]?.snapshot).toEqual(receipts[1]?.snapshot);
  }, 30_000);
});
