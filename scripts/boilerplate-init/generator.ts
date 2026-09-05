import { spawn } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import Ajv2020 from "ajv/dist/2020.js";
import {
  digestGeneratedSource,
  type GenerationReceipt,
  readSourceIdentity,
  stableSourceIdentity,
} from "./generation-receipt.ts";
import { applyProfile } from "./profile-application.ts";
import { validateProfileOutput } from "./profile-output-validator.ts";
import {
  type ProfileInitManifest,
  resolveProfile,
} from "./profile-resolver.ts";
import {
  assertNoSelectedSymlinks,
  sourcePathAllowed,
} from "./source-copy-policy.ts";

export interface InitManifest extends ProfileInitManifest {
  remove: string[];
  sourceExcludes: string[];
  validationCommands: string[];
  version: 2;
}

export interface GenerateOptions {
  appName: string;
  apps?: string[];
  install: boolean;
  profile?: string;
  sourceRoot: string;
  target: string;
  validate: boolean;
}

const GENERATED_GITIGNORE = `# Dependencies and build output
node_modules/
.pnpm-store/
.turbo/
.next/
dist/
storybook-static/
.react-email/
coverage/
*.tsbuildinfo
apps/*/next-env.d.ts

# Local environment and data
.env
.env.*
!.env.example
!.env.test.example
.data/
*.db
*.db-shm
*.db-wal
*.sqlite
*.sqlite3
*.sqlite-shm
*.sqlite-wal
*.log
*.pid

# OS and editor files
.DS_Store
`;
const GENERATED_DOCKERIGNORE = `.git
.github
.next
.react-email
.turbo
coverage
.data
dist
node_modules
.agentkit
.omp
.wizloft
out
playwright-report
storybook-static
test-results

**/.next
**/.react-email
**/.turbo
**/coverage
**/.data
**/dist
**/node_modules
**/out
**/playwright-report
**/storybook-static
**/test-results

.DS_Store
*.log
*.pem
*.tsbuildinfo

.env
.env.*
!.env.example
`;
const GENERATED_REPOMIXIGNORE = `dist/*
coverage/*
build/*
ios/*
android/*
__pycache__/*
node_modules/*
.agentkit/*
.omp/*
.wizloft/*

.opencode/*
.serena/*
.pnpm-store/*
.dart_tool/*
.idea/*
.husky/*
.venv/*
`;
const APP_SURFACES_PATTERN =
  /export const appSurfaces: readonly string\[\] = \[[\s\S]*?\];/;
const TEMPLATE_CI_STEP_PATTERN =
  /\n {6}- name: Validate templates\n {8}run: pnpm templates:validate\n/;
const GENERATED_CI_BUILD_STEP =
  "      - name: Build\n        run: pnpm build\n";
const GENERATED_CI_ENV_ANCHOR = '      SKIP_ENV_VALIDATION: "false"\n';
const GENERATED_CI_ENV = `${GENERATED_CI_ENV_ANCHOR}      MAIL_OUTBOX_DIR: apps/api/.data/mail
      MAIL_PROVIDER: console
      PLAYWRIGHT_REUSE_SERVER: "false"
`;
const GENERATED_CI_RUNTIME_STEPS = `${GENERATED_CI_BUILD_STEP}
      - name: Install Chromium
        run: pnpm exec playwright install --with-deps chromium

      - name: Run auth integration
        run: pnpm --filter @repo/auth test:integration

      - name: Run browser identity journeys
        run: pnpm test:e2e
`;
const REMOVED_PACKAGE_SCRIPTS = new Set([
  "boilerplate:init",
  "profiles:verify",
  "templates:list",
  "templates:json",
  "templates:validate",
]);

const packageSlug = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (!slug) {
    throw new Error("Project name must contain at least one letter or number.");
  }
  return slug;
};

const titleFromSlug = (slug: string) =>
  slug
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");

export const loadManifest = async (sourceRoot: string) => {
  const manifestPath = join(sourceRoot, "boilerplate.init.json");
  const schemaPath = join(
    sourceRoot,
    "scripts",
    "boilerplate-init",
    "manifest.schema.json"
  );
  let value: unknown;
  let schema: object;
  try {
    [value, schema] = await Promise.all([
      readFile(manifestPath, "utf8").then(JSON.parse),
      readFile(schemaPath, "utf8").then(JSON.parse),
    ]);
  } catch (error) {
    throw new Error(
      `Could not parse init manifest or schema: ${error instanceof Error ? error.message : "Unknown JSON error"}`
    );
  }

  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
    schema
  );
  if (!validate(value)) {
    const details = validate.errors
      ?.map((error) => `${error.instancePath || "/"} ${error.message}`)
      .join("; ");
    throw new Error(`Invalid init manifest: ${details ?? "unknown error"}`);
  }
  return value as InitManifest;
};

const run = (command: string, cwd: string) =>
  new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, { cwd, shell: true, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(new Error(`Command failed (${code ?? "unknown"}): ${command}`));
    });
  });

const runArgs = (command: string, args: string[], cwd: string) =>
  new Promise<void>((resolvePromise, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      reject(
        new Error(
          `Command failed (${code ?? "unknown"}): ${command} ${args.join(" ")}`
        )
      );
    });
  });

const formatGeneratedPaths = (
  sourceRoot: string,
  target: string,
  targetPaths: string[]
) =>
  runArgs(
    join(
      sourceRoot,
      "node_modules",
      ".bin",
      process.platform === "win32" ? "biome.cmd" : "biome"
    ),
    [
      "format",
      "--write",
      "--vcs-use-ignore-file=false",
      "--config-path",
      join(sourceRoot, "biome.jsonc"),
      ...targetPaths,
    ],
    target
  );

const resolveProspectiveRealPath = async (path: string) => {
  let existingAncestor = resolve(path);
  const missingSegments: string[] = [];

  while (true) {
    try {
      const canonicalAncestor = await realpath(existingAncestor);
      return resolve(canonicalAncestor, ...missingSegments.reverse());
    } catch (error) {
      const { code } = error as NodeJS.ErrnoException;
      if (code !== "ENOENT" && code !== "ENOTDIR") {
        throw error;
      }

      const parent = dirname(existingAncestor);
      if (parent === existingAncestor) {
        throw error;
      }
      missingSegments.push(basename(existingAncestor));
      existingAncestor = parent;
    }
  }
};

export const assertTarget = async (sourceRoot: string, target: string) => {
  const [resolvedSource, resolvedTarget] = await Promise.all([
    realpath(resolve(sourceRoot)),
    resolveProspectiveRealPath(target),
  ]);
  if (resolvedTarget === resolvedSource) {
    throw new Error("Target must not be the boilerplate source directory.");
  }
  if (resolvedTarget.startsWith(`${resolvedSource}${sep}`)) {
    throw new Error(
      "Target must not be inside the boilerplate source directory."
    );
  }
  if (resolvedSource.startsWith(`${resolvedTarget}${sep}`)) {
    throw new Error(
      "Target must not contain the boilerplate source directory."
    );
  }
};

const rewritePackage = async (target: string, slug: string) => {
  const path = join(target, "package.json");
  const packageJson = JSON.parse(await readFile(path, "utf8")) as {
    description: string;
    devDependencies: Record<string, string>;
    name: string;
    scripts: Record<string, string>;
  };
  packageJson.name = slug;
  packageJson.description = `${titleFromSlug(slug)} application monorepo.`;
  packageJson.scripts = Object.fromEntries(
    Object.entries(packageJson.scripts).filter(
      ([name]) => !REMOVED_PACKAGE_SCRIPTS.has(name)
    )
  );
  packageJson.devDependencies = Object.fromEntries(
    Object.entries(packageJson.devDependencies).filter(
      ([name]) => name !== "ajv"
    )
  );
  packageJson.scripts["release:check"] =
    "pnpm check:ci && pnpm check-types && pnpm test && pnpm boundaries && pnpm build";
  packageJson.scripts.postinstall = "node scripts/postinstall.mjs";
  await writeFile(path, `${JSON.stringify(packageJson, null, 2)}\n`);
};

const rewriteBranding = async (
  target: string,
  slug: string,
  appName: string,
  selectedApps: string[]
) => {
  const replacements: [string, string][] = [
    ["Personal SaaS Boilerplate", appName],
    ["personal-saas-boilerplate", slug],
    ["personal_saas_boilerplate", slug.replaceAll("-", "_")],
  ];
  const paths = [
    ".env.example",
    ".env.test.example",
    ".github/workflows/ci.yml",
    "apps/app/app/layout.tsx",
    "apps/web/app/layout.tsx",
    "apps/web/app/page.tsx",
    "docker-compose.yml",
    "packages/api/src/openapi.ts",
    "packages/config/src/app.ts",
    "scripts/e2e-with-db.mjs",
  ];
  for (const entry of paths) {
    const path = join(target, entry);
    try {
      let contents = await readFile(path, "utf8");
      for (const [from, to] of replacements) {
        contents = contents.replaceAll(from, to);
      }
      contents = contents.replace(
        APP_SURFACES_PATTERN,
        `export const appSurfaces: readonly string[] = [\n${selectedApps.map((app) => `  "apps/${app}",`).join("\n")}\n];`
      );
      contents = contents.replace(TEMPLATE_CI_STEP_PATTERN, "\n");
      await writeFile(path, contents);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
    }
  }
};

const rewriteGeneratedConfig = async (target: string) => {
  const indexPath = join(target, "packages/config/src/index.ts");
  const index = await readFile(indexPath, "utf8");
  await writeFile(
    indexPath,
    index.replace('export * from "./templates";\n', "")
  );
  const ciPath = join(target, ".github/workflows/ci.yml");
  let ci = await readFile(ciPath, "utf8");
  if (
    !(
      ci.includes(GENERATED_CI_BUILD_STEP) &&
      ci.includes(GENERATED_CI_ENV_ANCHOR)
    )
  ) {
    throw new Error("Generated CI anchors could not be located.");
  }
  ci = ci
    .replace(GENERATED_CI_ENV_ANCHOR, GENERATED_CI_ENV)
    .replace(GENERATED_CI_BUILD_STEP, GENERATED_CI_RUNTIME_STEPS);
  await writeFile(ciPath, ci);
};

const generatedReadme = (
  appName: string,
  selectedApps: string[],
  profile: string
) => `# ${appName}

Generated from the Wizloft \`${profile}\` profile.

\`boilerplate.receipt.json\` records the selected profile, initial generated-source
digest, and best-effort source identity. It is passive origin metadata; builds
and runtime behavior do not depend on it.

## Apps

${selectedApps.map((app) => `- \`apps/${app}\``).join("\n")}

## Setup

\`\`\`bash
corepack pnpm install
cp .env.example .env
docker compose up -d postgres
corepack pnpm db:generate
corepack pnpm db:migrate:deploy
corepack pnpm db:seed
corepack pnpm dev
\`\`\`

Run \`corepack pnpm release:check\` before release.
`;

const generatedSpec = (
  appName: string,
  selectedApps: string[],
  profile: string
) => `# ${appName}

## Foundation
Profile: \`${profile}\`


- pnpm and Turborepo monorepo
- TypeScript strict and Ultracite-on-Biome
- Next.js App Router, Hono, Better Auth, Prisma, and PostgreSQL
- Shared shadcn Base UI design system
- Vitest and Playwright

## App Surfaces

${selectedApps.map((app) => `- \`apps/${app}\``).join("\n")}

## Boundaries

- Apps do not import from other apps.
- Packages do not import from apps.
- Optional integrations disable cleanly when credentials are absent.
- Product-specific domain behavior stays outside reusable core packages.
`;

export const generateProject = async (options: GenerateOptions) => {
  const sourceRoot = resolve(options.sourceRoot);
  const target = resolve(options.target);
  await assertTarget(sourceRoot, target);
  const manifest = await loadManifest(sourceRoot);
  const resolvedProfile = resolveProfile(manifest, {
    apps: options.apps,
    profile: options.profile,
  });
  const selectedApps = resolvedProfile.apps;
  const slug = packageSlug(basename(target));
  const appName = options.appName || titleFromSlug(slug);
  const sourceIdentityBefore = readSourceIdentity(sourceRoot);
  await assertNoSelectedSymlinks({
    remove: manifest.remove,
    sourceExcludes: manifest.sourceExcludes,
    sourceRoot,
  });

  await mkdir(target, { recursive: false });
  try {
    await cp(sourceRoot, target, {
      filter: (source) =>
        sourcePathAllowed({
          entry: relative(sourceRoot, source),
          remove: manifest.remove,
          sourceExcludes: manifest.sourceExcludes,
        }),
      recursive: true,
    });

    for (const entry of manifest.remove) {
      await rm(join(target, entry), { force: true, recursive: true });
    }
    for (const app of [...manifest.requiredApps, ...manifest.optionalApps]) {
      if (!selectedApps.includes(app)) {
        await rm(join(target, "apps", app), { force: true, recursive: true });
      }
    }

    await applyProfile({
      resolved: resolvedProfile,
      sourceRoot,
      target,
    });
    await rewritePackage(target, slug);
    await rewriteBranding(target, slug, appName, selectedApps);
    await rewriteGeneratedConfig(target);
    await writeFile(join(target, ".gitignore"), GENERATED_GITIGNORE);
    await validateProfileOutput({ resolved: resolvedProfile, target });
    await writeFile(join(target, ".dockerignore"), GENERATED_DOCKERIGNORE);
    await writeFile(join(target, ".repomixignore"), GENERATED_REPOMIXIGNORE);
    await writeFile(
      join(target, "README.md"),
      generatedReadme(appName, selectedApps, resolvedProfile.profile)
    );
    await writeFile(
      join(target, "SPEC.md"),
      generatedSpec(appName, selectedApps, resolvedProfile.profile)
    );
    await rm(join(target, "boilerplate.init.json"), { force: true });
    if (!options.install) {
      await rm(join(target, "pnpm-lock.yaml"), { force: true });
    }
    await formatGeneratedPaths(sourceRoot, target, ["."]);

    const [sourcePackage, receiptSchema, snapshot] = await Promise.all([
      readFile(join(sourceRoot, "package.json"), "utf8").then(
        JSON.parse
      ) as Promise<{
        engines: { node: string };
        packageManager: string;
        version: string;
      }>,
      readFile(
        join(
          sourceRoot,
          "scripts/boilerplate-init/generation-receipt.schema.json"
        ),
        "utf8"
      ).then(JSON.parse),
      digestGeneratedSource(target),
    ]);
    const receipt: GenerationReceipt = {
      generatedAt: new Date().toISOString(),
      generation: {
        installRequested: options.install,
        validationRequested: options.validate,
      },
      generator: {
        name: "wizloft-boilerplate-init",
        version: sourcePackage.version,
      },
      schemaVersion: 1,
      selection: { apps: selectedApps, profile: resolvedProfile.profile },
      snapshot: {
        algorithm: "sha256",
        digest: snapshot.digest,
        fileCount: snapshot.fileCount,
        format: "path-content-v1",
        scope: "generated-source-before-install",
      },
      source: stableSourceIdentity(
        sourceIdentityBefore,
        readSourceIdentity(sourceRoot)
      ),
      toolchain: {
        nodeRange: sourcePackage.engines.node,
        packageManager: sourcePackage.packageManager,
      },
    };
    const validateReceipt = new Ajv2020({
      allErrors: true,
      strict: true,
    }).compile(receiptSchema);
    if (!validateReceipt(receipt)) {
      const details = validateReceipt.errors
        ?.map((error) => `${error.instancePath || "/"} ${error.message}`)
        .join("; ");
      throw new Error(
        `Invalid generation receipt: ${details ?? "unknown error"}`
      );
    }
    await writeFile(
      join(target, "boilerplate.receipt.json"),
      `${JSON.stringify(receipt, null, 2)}\n`
    );
    await formatGeneratedPaths(sourceRoot, target, [
      "boilerplate.receipt.json",
    ]);
    await copyFile(join(target, ".env.example"), join(target, ".env"));

    if (options.install) {
      await run("pnpm install --no-frozen-lockfile", target);
    }
    if (options.validate) {
      if (!options.install) {
        throw new Error("Validation requires dependency installation.");
      }
      for (const command of manifest.validationCommands) {
        await run(command, target);
      }
    }
  } catch (error) {
    await rm(target, { force: true, recursive: true }).catch((cleanupError) => {
      console.error(
        "Could not clean the failed generation target.",
        cleanupError
      );
    });
    throw error;
  }

  return {
    appName,
    profile: resolvedProfile.profile,
    selectedApps,
    slug,
    target,
  };
};
