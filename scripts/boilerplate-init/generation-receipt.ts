import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { realpathSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";

export type SourceMetadataState =
  | "available"
  | "git-unavailable"
  | "not-git"
  | "unavailable"
  | "unborn";

export interface SourceIdentity {
  commit: string | null;
  dirty: boolean | null;
  kind: "directory" | "git-checkout";
  metadataState: SourceMetadataState;
  tree: string | null;
}

export interface GenerationReceipt {
  generatedAt: string;
  generation: {
    installRequested: boolean;
    validationRequested: boolean;
  };
  generator: { name: "wizloft-boilerplate-init"; version: string };
  schemaVersion: 1;
  selection: { apps: string[]; profile: "core" | "saas" };
  snapshot: {
    algorithm: "sha256";
    digest: string;
    fileCount: number;
    format: "path-content-v1";
    scope: "generated-source-before-install";
  };
  source: SourceIdentity;
  toolchain: { nodeRange: string; packageManager: string };
}

const SNAPSHOT_EXCLUDED_DIRECTORIES: Readonly<Record<string, true>> = {
  ".data": true,
  ".next": true,
  ".pnpm-store": true,
  ".turbo": true,
  coverage: true,
  dist: true,
  node_modules: true,
  "playwright-report": true,
  "storybook-static": true,
  "test-results": true,
};
const LOCKFILE_PATTERN =
  /^(?:bun\.lockb?|package-lock\.json|pnpm-lock\.yaml|yarn\.lock)$/u;

const git = (sourceRoot: string, args: string[]) =>
  spawnSync("git", args, {
    cwd: sourceRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

export const readSourceIdentity = (sourceRoot: string): SourceIdentity => {
  const topLevel = git(sourceRoot, ["rev-parse", "--show-toplevel"]);
  if (
    topLevel.error &&
    (topLevel.error as NodeJS.ErrnoException).code === "ENOENT"
  ) {
    return {
      commit: null,
      dirty: null,
      kind: "directory",
      metadataState: "git-unavailable",
      tree: null,
    };
  }
  if (topLevel.status !== 0) {
    return {
      commit: null,
      dirty: null,
      kind: "directory",
      metadataState: "not-git",
      tree: null,
    };
  }
  const canonicalTopLevel = resolve(topLevel.stdout.trim());
  if (canonicalTopLevel !== resolve(realpathSync(sourceRoot))) {
    return {
      commit: null,
      dirty: null,
      kind: "directory",
      metadataState: "not-git",
      tree: null,
    };
  }

  const status = git(sourceRoot, [
    "status",
    "--porcelain=v1",
    "--untracked-files=normal",
  ]);
  const commit = git(sourceRoot, ["rev-parse", "--verify", "HEAD"]);
  const tree = git(sourceRoot, ["rev-parse", "--verify", "HEAD^{tree}"]);
  if (commit.status !== 0 || tree.status !== 0) {
    return {
      commit: null,
      dirty: status.status === 0 ? status.stdout.length > 0 : null,
      kind: "git-checkout",
      metadataState: "unborn",
      tree: null,
    };
  }
  if (status.status !== 0) {
    return {
      commit: null,
      dirty: null,
      kind: "git-checkout",
      metadataState: "unavailable",
      tree: null,
    };
  }
  return {
    commit: commit.stdout.trim(),
    dirty: status.stdout.length > 0,
    kind: "git-checkout",
    metadataState: "available",
    tree: tree.stdout.trim(),
  };
};

export const stableSourceIdentity = (
  before: SourceIdentity,
  after: SourceIdentity
): SourceIdentity => {
  if (JSON.stringify(before) === JSON.stringify(after)) {
    return before;
  }
  return {
    commit: null,
    dirty: null,
    kind:
      before.kind === "git-checkout" || after.kind === "git-checkout"
        ? "git-checkout"
        : "directory",
    metadataState: "unavailable",
    tree: null,
  };
};

const snapshotFileAllowed = (path: string) => {
  const segments = path.split("/");
  const basename = segments.at(-1) ?? "";
  if (
    basename === "boilerplate.receipt.json" ||
    LOCKFILE_PATTERN.test(basename) ||
    (basename.startsWith(".env") &&
      basename !== ".env.example" &&
      basename !== ".env.test.example")
  ) {
    return false;
  }
  return !segments.some(
    (segment) => SNAPSHOT_EXCLUDED_DIRECTORIES[segment] === true
  );
};

const writeLength = (length: number) => {
  const buffer = Buffer.allocUnsafe(8);
  buffer.writeBigUInt64BE(BigInt(length));
  return buffer;
};

export const digestGeneratedSource = async (target: string) => {
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const absolute = join(directory, entry.name);
      const path = relative(target, absolute).split(sep).join("/");
      if (!snapshotFileAllowed(path)) {
        continue;
      }
      if (entry.isDirectory()) {
        await visit(absolute);
      } else if (entry.isFile()) {
        files.push(path);
      }
    }
  };
  await visit(target);
  files.sort((left, right) =>
    Buffer.compare(Buffer.from(left), Buffer.from(right))
  );

  const hash = createHash("sha256");
  for (const path of files) {
    const pathBytes = Buffer.from(path, "utf8");
    const contents = await readFile(join(target, path));
    hash.update(writeLength(pathBytes.length));
    hash.update(pathBytes);
    hash.update(writeLength(contents.length));
    hash.update(contents);
  }
  return { digest: hash.digest("hex"), fileCount: files.length };
};
