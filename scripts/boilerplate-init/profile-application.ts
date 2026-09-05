import {
  access,
  mkdir,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { dirname, join, relative, sep } from "node:path";
import type { ResolvedProfile } from "./profile-resolver.ts";

export const CORE_REMOVALS = [
  "apps/app/app/dashboard/organizations-panel.tsx",
  "apps/app/app/invite",
  "apps/app/app/settings/access",
  "apps/app/app/settings/members",
  "apps/storybook/src/app-shell.stories.tsx",
  "apps/storybook/src/forms-and-states.stories.tsx",
  "apps/email/src/templates/invite-user.tsx",
  "packages/api/src/app.test.ts",
  "packages/api/src/client/client.test.ts",
  "packages/api/src/contracts/base.ts",
  "packages/api/src/contracts/files.ts",
  "packages/api/src/contracts/invitations.ts",
  "packages/api/src/contracts/jobs.ts",
  "packages/api/src/contracts/organizations.test.ts",
  "packages/api/src/contracts/organizations.ts",
  "packages/api/src/openapi.test.ts",
  "packages/api/src/routers/files.ts",
  "packages/api/src/routers/invitations.ts",
  "packages/api/src/routers/jobs.ts",
  "packages/api/src/routers/organizations.ts",
  "packages/auth/integration",
  "packages/auth/src/access-control.test.ts",
  "packages/auth/src/access-control.ts",
  "packages/auth/src/auth-options.test.ts",
  "packages/auth/src/invitations.test.ts",
  "packages/auth/src/invitations.ts",
  "packages/auth/src/organizations.test.ts",
  "packages/auth/src/organizations.ts",
  "packages/auth/src/pagination.test.ts",
  "packages/auth/src/pagination.ts",
  "packages/auth/src/permissions.test.ts",
  "packages/auth/src/permissions.ts",
  "packages/config/src/features.test.ts",
  "packages/config/src/navigation.test.ts",
  "packages/config/src/plans.ts",
  "packages/database/prisma/migrations",
  "packages/database/src/seed.test.ts",
  "packages/database/src/system-roles.test.ts",
  "packages/database/src/system-roles.ts",
  "packages/mail/src/invitation.test.tsx",
  "packages/logger/src/index.ts",
  "packages/mail/src/invitation.tsx",
  "tests/e2e/invitations.spec.ts",
  "tests/e2e/organizations.spec.ts",
  "packages/test/src/index.ts",
  "tests/e2e/support/user-flows.ts",
] as const;
const CORE_ENV_PREFIXES = [
  "CMS_",
  "LOCAL_STORAGE_",
  "NEXT_PUBLIC_POSTHOG_",
  "POSTHOG_",
  "R2_",
  "S3_",
  "STORAGE_",
  "STRIPE_",
] as const;
const CORE_PROFILE_APP_ASSETS = ["storybook", "web"] as const;

const copyProfileAssets = async (assetsRoot: string, target: string) => {
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const source = join(directory, entry.name);
      if (entry.isDirectory()) {
        await visit(source);
        continue;
      }
      if (!(entry.isFile() && entry.name.endsWith(".tpl"))) {
        continue;
      }
      const destination = join(
        target,
        relative(assetsRoot, source).split(sep).join("/").slice(0, -4)
      );
      await mkdir(dirname(destination), { recursive: true });
      await writeFile(destination, await readFile(source));
    }
  };
  await visit(assetsRoot);
};

const pruneDependencyMap = (
  value: unknown,
  retainedPackages: ReadonlySet<string>
) => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return;
  }
  for (const dependency of Object.keys(value)) {
    if (
      dependency.startsWith("@repo/") &&
      !retainedPackages.has(dependency.slice("@repo/".length))
    ) {
      delete (value as Record<string, unknown>)[dependency];
    }
  }
};

const pruneMissingExports = async (
  directory: string,
  manifest: Record<string, unknown>
) => {
  if (typeof manifest.exports !== "object" || manifest.exports === null) {
    return;
  }
  for (const [key, value] of Object.entries(manifest.exports)) {
    if (typeof value !== "string") {
      continue;
    }
    await access(join(directory, value)).catch(() => {
      delete (manifest.exports as Record<string, unknown>)[key];
    });
  }
};

const rewriteWorkspaceManifest = async (
  directory: string,
  retainedPackages: ReadonlySet<string>
) => {
  const manifestPath = join(directory, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as Record<
    string,
    unknown
  >;
  for (const field of [
    "dependencies",
    "devDependencies",
    "optionalDependencies",
    "peerDependencies",
  ]) {
    pruneDependencyMap(manifest[field], retainedPackages);
  }
  await pruneMissingExports(directory, manifest);
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
};

const rewriteWorkspaceManifests = async (
  target: string,
  retainedPackages: ReadonlySet<string>
) => {
  for (const parent of ["apps", "packages"] as const) {
    for (const entry of await readdir(join(target, parent), {
      withFileTypes: true,
    })) {
      if (entry.isDirectory()) {
        await rewriteWorkspaceManifest(
          join(target, parent, entry.name),
          retainedPackages
        );
      }
    }
  }
};

const rewriteCoreBoundaryConfig = async (
  target: string,
  retained: Set<string>
) => {
  const path = join(target, "boundaries.config.json");
  const config = JSON.parse(await readFile(path, "utf8")) as {
    clientSafeEntrypoints: Record<string, string[]>;
    forbiddenImportExceptions: Record<string, Record<string, string[]>>;
    forbiddenPackageImports: Record<string, string[]>;
    packageRules: Record<string, string[]>;
  };
  const keepWorkspace = (name: string) =>
    !name.startsWith("@repo/") || retained.has(name.slice("@repo/".length));
  config.clientSafeEntrypoints = Object.fromEntries(
    Object.entries(config.clientSafeEntrypoints).filter(([name]) =>
      keepWorkspace(name)
    )
  );
  config.packageRules = Object.fromEntries(
    Object.entries(config.packageRules)
      .filter(([name]) => keepWorkspace(name))
      .map(([name, dependencies]) => [name, dependencies.filter(keepWorkspace)])
  );
  config.forbiddenPackageImports = Object.fromEntries(
    Object.entries(config.forbiddenPackageImports).filter(([name]) =>
      keepWorkspace(name)
    )
  );
  config.forbiddenImportExceptions = Object.fromEntries(
    Object.entries(config.forbiddenImportExceptions).filter(([name]) =>
      keepWorkspace(name)
    )
  );
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`);
};

const keepCoreEnvironmentName = (name: string) =>
  !CORE_ENV_PREFIXES.some((prefix) => name.startsWith(prefix));

const rewriteEnvironment = async (
  target: string,
  resolved: ResolvedProfile
) => {
  const keepEnvironmentName = (name: string) =>
    (resolved.apps.includes("docs") || name !== "NEXT_PUBLIC_DOCS_URL") &&
    (resolved.profile !== "core" || keepCoreEnvironmentName(name));

  for (const filename of [".env.example", ".env.test.example"]) {
    const path = join(target, filename);
    const lines = (await readFile(path, "utf8")).split("\n");
    const appUrl = lines
      .find((line) => line.startsWith("NEXT_PUBLIC_APP_URL="))
      ?.slice("NEXT_PUBLIC_APP_URL=".length);
    const rewritten = lines
      .filter((line) => {
        const separator = line.indexOf("=");
        return (
          separator === -1 ||
          keepEnvironmentName(line.slice(0, separator).trim())
        );
      })
      .map((line) =>
        !resolved.apps.includes("web") &&
        appUrl &&
        line.startsWith("NEXT_PUBLIC_WEB_URL=")
          ? `NEXT_PUBLIC_WEB_URL=${appUrl}`
          : line
      )
      .join("\n");
    await writeFile(path, rewritten);
  }

  const turboPath = join(target, "turbo.json");
  const turbo = JSON.parse(await readFile(turboPath, "utf8")) as Record<
    string,
    unknown
  >;
  const visit = (value: unknown): void => {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      return;
    }
    for (const [key, nested] of Object.entries(value)) {
      if (key.endsWith("Env") && Array.isArray(nested)) {
        (value as Record<string, unknown>)[key] = nested.filter(
          (name) => typeof name !== "string" || keepEnvironmentName(name)
        );
      } else {
        visit(nested);
      }
    }
  };

  const ciPath = join(target, ".github/workflows/ci.yml");
  let ci = await readFile(ciPath, "utf8");
  if (!resolved.apps.includes("web")) {
    ci = ci.replace(
      "      NEXT_PUBLIC_WEB_URL: http://localhost:3001",
      "      NEXT_PUBLIC_WEB_URL: http://localhost:3000"
    );
  }
  if (!resolved.apps.includes("docs")) {
    ci = ci.replace("      NEXT_PUBLIC_DOCS_URL: http://localhost:3003\n", "");
  }
  await writeFile(ciPath, ci);
  visit(turbo);
  await writeFile(turboPath, `${JSON.stringify(turbo, null, 2)}\n`);
};
const rewriteCoreAuthManifest = async (target: string) => {
  const path = join(target, "packages/auth/package.json");
  const manifest = JSON.parse(await readFile(path, "utf8")) as {
    scripts?: Record<string, string>;
  };
  if (manifest.scripts) {
    manifest.scripts["test:integration"] =
      "vitest run integration/identity.integration.test.ts";
  }
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`);
};

export const applyProfile = async (input: {
  resolved: ResolvedProfile;
  sourceRoot: string;
  target: string;
}) => {
  if (input.resolved.apps.includes("docs")) {
    await copyProfileAssets(
      join(input.sourceRoot, "scripts/boilerplate-init/profiles/shared/files"),
      input.target
    );
  }
  await rewriteEnvironment(input.target, input.resolved);
  if (input.resolved.profile !== "core" || !input.resolved.packages) {
    return;
  }

  const retained = new Set(input.resolved.packages);
  for (const entry of await readdir(join(input.target, "packages"), {
    withFileTypes: true,
  })) {
    if (entry.isDirectory() && !retained.has(entry.name)) {
      await rm(join(input.target, "packages", entry.name), {
        force: true,
        recursive: true,
      });
    }
  }
  for (const path of CORE_REMOVALS) {
    await rm(join(input.target, path), { force: true, recursive: true });
  }
  await copyProfileAssets(
    join(input.sourceRoot, "scripts/boilerplate-init/profiles/core/files"),
    input.target
  );
  for (const app of CORE_PROFILE_APP_ASSETS) {
    if (!input.resolved.apps.includes(app)) {
      await rm(join(input.target, "apps", app), {
        force: true,
        recursive: true,
      });
    }
  }
  await rewriteWorkspaceManifests(input.target, retained);
  await rewriteCoreBoundaryConfig(input.target, retained);

  await rewriteCoreAuthManifest(input.target);
  const nextConfigPath = join(input.target, "apps/app/next.config.ts");
  const nextConfig = await readFile(nextConfigPath, "utf8");
  await writeFile(
    nextConfigPath,
    nextConfig.replace('    "@repo/access-control",\n', "")
  );
};
