import { spawn } from "node:child_process";
import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

export interface InitManifest {
  defaultApps: string[];
  optionalApps: string[];
  remove: string[];
  requiredApps: string[];
  sourceExcludes: string[];
  validationCommands: string[];
  version: 1;
}

export interface GenerateOptions {
  appName: string;
  apps?: string[];
  install: boolean;
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

# Tests
test-results/
playwright-report/

# Local environment and data
.env
.data/

# OS and editor files
.DS_Store
`;
const APP_SURFACES_PATTERN =
  /export const appSurfaces: readonly string\[\] = \[[\s\S]*?\];/;
const TEMPLATE_CI_STEP_PATTERN =
  /\n {6}- name: Validate templates\n {8}run: pnpm templates:validate\n/;
const REMOVED_PACKAGE_SCRIPTS = new Set([
  "boilerplate:init",
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
  const value = JSON.parse(
    await readFile(join(sourceRoot, "boilerplate.init.json"), "utf8")
  ) as InitManifest;
  if (value.version !== 1) {
    throw new Error(`Unsupported init manifest version: ${value.version}`);
  }
  return value;
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

const assertTarget = (sourceRoot: string, target: string) => {
  const resolvedSource = resolve(sourceRoot);
  const resolvedTarget = resolve(target);
  if (resolvedTarget === resolvedSource) {
    throw new Error("Target must not be the boilerplate source directory.");
  }
  if (resolvedSource.startsWith(`${resolvedTarget}${sep}`)) {
    throw new Error(
      "Target must not contain the boilerplate source directory."
    );
  }
};

const selectApps = (manifest: InitManifest, requested?: string[]) => {
  const known = new Set([...manifest.requiredApps, ...manifest.optionalApps]);
  const selected = [...new Set(requested ?? manifest.defaultApps)];
  const unknown = selected.filter((app) => !known.has(app));
  if (unknown.length > 0) {
    throw new Error(`Unknown app surface(s): ${unknown.join(", ")}`);
  }
  const missing = manifest.requiredApps.filter(
    (app) => !selected.includes(app)
  );
  if (missing.length > 0) {
    throw new Error(`Required app surface(s) missing: ${missing.join(", ")}`);
  }
  return selected;
};

const rewritePackage = async (target: string, slug: string) => {
  const path = join(target, "package.json");
  const packageJson = JSON.parse(await readFile(path, "utf8")) as {
    description: string;
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

const generatedReadme = (
  appName: string,
  selectedApps: string[]
) => `# ${appName}

Generated from the Wizloft personal SaaS boilerplate.

## Apps

${selectedApps.map((app) => `- \`apps/${app}\``).join("\n")}

## Setup

\`\`\`bash
pnpm install
cp .env.example .env
docker compose up -d postgres
pnpm db:generate
pnpm db:push
pnpm db:seed
pnpm dev
\`\`\`

Run \`pnpm release:check\` before release.
`;

const generatedSpec = (appName: string, selectedApps: string[]) => `# ${appName}

## Foundation

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
  assertTarget(sourceRoot, target);
  const manifest = await loadManifest(sourceRoot);
  const selectedApps = selectApps(manifest, options.apps);
  const slug = packageSlug(basename(target));
  const appName = options.appName || titleFromSlug(slug);

  await mkdir(target, { recursive: false });
  try {
    const excluded = new Set(manifest.sourceExcludes);
    await cp(sourceRoot, target, {
      filter: (source) => {
        const entry = relative(sourceRoot, source);
        if (!entry) {
          return true;
        }
        const segments = entry.split(sep);
        const isRemoved = manifest.remove.some(
          (removed) => entry === removed || entry.startsWith(`${removed}${sep}`)
        );
        return !(
          isRemoved || segments.some((segment) => excluded.has(segment))
        );
      },
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

    await rewritePackage(target, slug);
    await rewriteBranding(target, slug, appName, selectedApps);
    await writeFile(join(target, ".gitignore"), GENERATED_GITIGNORE);
    await writeFile(
      join(target, "README.md"),
      generatedReadme(appName, selectedApps)
    );
    await writeFile(
      join(target, "SPEC.md"),
      generatedSpec(appName, selectedApps)
    );
    await copyFile(join(target, ".env.example"), join(target, ".env"));
    await rm(join(target, "boilerplate.init.json"), { force: true });

    if (options.install) {
      await run("pnpm install", target);
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
    await rm(target, { force: true, recursive: true });
    throw error;
  }

  return { appName, selectedApps, slug, target };
};
