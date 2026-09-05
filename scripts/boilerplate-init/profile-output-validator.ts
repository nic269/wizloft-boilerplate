import { access, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { CORE_REMOVALS } from "./profile-application.ts";
import type { ResolvedProfile } from "./profile-resolver.ts";

const DEPENDENCY_FIELDS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
] as const;
const CORE_MODELS = "User,Session,Account,Verification";
const CORE_REPLACED_DIRECTORIES = new Set([
  "packages/auth/integration",
  "packages/database/prisma/migrations",
  "apps/storybook/src/app-shell.stories.tsx",
  "apps/storybook/src/forms-and-states.stories.tsx",
  "packages/api/src/contracts/base.ts",
  "packages/logger/src/index.ts",
  "packages/test/src/index.ts",
  "tests/e2e/support/user-flows.ts",
]);
const CORE_FORBIDDEN_CONTENT: Readonly<Record<string, string[]>> = {
  "apps/storybook/src/app-shell.stories.tsx": [
    "Invite member",
    "Members",
    "Acme Workspace",
  ],
  "apps/storybook/src/forms-and-states.stories.tsx": [
    "Send invite",
    "Create invitation",
  ],
  "packages/api/src/contracts/base.ts": ["INVITATION_"],
  "packages/logger/src/index.ts": ["organizationId"],
  "packages/test/src/index.ts": ["mockOrganization"],
  "tests/e2e/support/user-flows.ts": ["createOrganization"],
};
const CORE_EXCLUDED_PATHS = [
  "packages/access-control",
  ...CORE_REMOVALS.filter((path) => !CORE_REPLACED_DIRECTORIES.has(path)),
] as const;
const CORE_EXCLUDED_ENV_PREFIXES = [
  "CMS_",
  "LOCAL_STORAGE_",
  "NEXT_PUBLIC_POSTHOG_",
  "POSTHOG_",
  "R2_",
  "S3_",
  "STORAGE_",
  "STRIPE_",
] as const;
const GENERATED_ARTIFACT_DIRECTORIES = new Set([
  ".next",
  ".react-email",
  "build",
  "dist",
  "out",
  "target",
]);

const workspaceDirectories = async (
  target: string,
  parent: "apps" | "packages"
) =>
  (await readdir(join(target, parent), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const validatePackageInventory = (
  actual: string[],
  expectedPackages: string[] | null
) => {
  if (!expectedPackages) {
    return;
  }
  const expected = [...expectedPackages].sort();
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `Generated package inventory mismatch: expected ${expected.join(", ")}; received ${actual.join(", ")}`
    );
  }
};

const validateManifestDependencies = (
  manifest: Record<string, unknown>,
  owner: string,
  packageNames: ReadonlySet<string>
) => {
  for (const field of DEPENDENCY_FIELDS) {
    const dependencies = manifest[field];
    if (
      typeof dependencies !== "object" ||
      dependencies === null ||
      Array.isArray(dependencies)
    ) {
      continue;
    }
    const missing = Object.keys(dependencies).find(
      (dependency) =>
        dependency.startsWith("@repo/") && !packageNames.has(dependency)
    );
    if (missing) {
      throw new Error(`${owner} references removed workspace ${missing}`);
    }
  }
};

const validateDependencyClosure = async (
  target: string,
  packageNames: ReadonlySet<string>
) => {
  for (const parent of ["apps", "packages"] as const) {
    for (const name of await workspaceDirectories(target, parent)) {
      const manifest = JSON.parse(
        await readFile(join(target, parent, name, "package.json"), "utf8")
      ) as Record<string, unknown>;
      validateManifestDependencies(manifest, `${parent}/${name}`, packageNames);
    }
  }
};
const validateNoBuildArtifacts = async (target: string) => {
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (!entry.isDirectory()) {
        continue;
      }
      if (GENERATED_ARTIFACT_DIRECTORIES.has(entry.name)) {
        throw new Error(
          `Generated output retained build artifact directory: ${join(directory, entry.name)}`
        );
      }
      await visit(join(directory, entry.name));
    }
  };
  await visit(target);
};

const validateSelectedEnvironment = async (
  target: string,
  resolved: ResolvedProfile
) => {
  for (const filename of [".env.example", ".env.test.example"]) {
    const values = Object.fromEntries(
      (await readFile(join(target, filename), "utf8"))
        .split("\n")
        .filter((line) => line.includes("="))
        .map((line) => {
          const separator = line.indexOf("=");
          return [line.slice(0, separator), line.slice(separator + 1)];
        })
    );
    if (
      !resolved.apps.includes("web") &&
      values.NEXT_PUBLIC_WEB_URL !== values.NEXT_PUBLIC_APP_URL
    ) {
      throw new Error(
        `${filename} must use the app origin when web is not selected`
      );
    }
    if (!resolved.apps.includes("docs") && "NEXT_PUBLIC_DOCS_URL" in values) {
      throw new Error(`${filename} retained the unselected docs URL`);
    }
  }
};

const validateCoreOutput = async (target: string) => {
  const schema = await readFile(
    join(target, "packages/database/prisma/schema.prisma"),
    "utf8"
  );
  const models = [...schema.matchAll(/^model\s+(\w+)/gmu)]
    .map((match) => match[1])
    .join(",");
  if (models !== CORE_MODELS) {
    throw new Error(`Core Prisma model inventory mismatch: ${models}`);
  }
  for (const removedPath of CORE_EXCLUDED_PATHS) {
    await access(join(target, removedPath)).then(
      () => {
        throw new Error(`Core output retained excluded path: ${removedPath}`);
      },
      () => undefined
    );
  }
  for (const filename of [".env.example", ".env.test.example"]) {
    const environment = await readFile(join(target, filename), "utf8");
    for (const line of environment.split("\n")) {
      const separator = line.indexOf("=");
      if (
        separator !== -1 &&
        CORE_EXCLUDED_ENV_PREFIXES.some((prefix) =>
          line.slice(0, separator).trim().startsWith(prefix)
        )
      ) {
        throw new Error(
          `Core output retained provider environment key: ${line}`
        );
      }
    }
  }
  for (const [path, forbiddenValues] of Object.entries(
    CORE_FORBIDDEN_CONTENT
  )) {
    let contents: string;
    try {
      contents = await readFile(join(target, path), "utf8");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        continue;
      }
      throw error;
    }
    const forbiddenValue = forbiddenValues.find((value) =>
      contents.includes(value)
    );
    if (forbiddenValue) {
      throw new Error(
        `Core output retained domain content in ${path}: ${forbiddenValue}`
      );
    }
  }
};

export const validateProfileOutput = async (input: {
  resolved: ResolvedProfile;
  target: string;
}) => {
  const packages = await workspaceDirectories(input.target, "packages");
  validatePackageInventory(packages, input.resolved.packages);
  await validateDependencyClosure(
    input.target,
    new Set(packages.map((name) => `@repo/${name}`))
  );
  await validateNoBuildArtifacts(input.target);
  await validateSelectedEnvironment(input.target, input.resolved);
  if (input.resolved.profile === "core") {
    await validateCoreOutput(input.target);
  }
};
