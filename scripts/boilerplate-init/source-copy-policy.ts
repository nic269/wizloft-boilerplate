import { readdir } from "node:fs/promises";
import { join, sep } from "node:path";

const LOCAL_DIRECTORY_NAMES: Readonly<Record<string, true>> = {
  ".agentkit": true,
  ".cache": true,
  ".data": true,
  ".next": true,
  ".omp": true,
  ".pnpm-store": true,
  ".react-email": true,
  ".turbo": true,
  ".wizloft": true,
  build: true,
  coverage: true,
  dist: true,
  node_modules: true,
  out: true,
  "playwright-report": true,
  "storybook-static": true,
  target: true,
  "test-results": true,
};
const ENV_EXAMPLES: Readonly<Record<string, true>> = {
  ".env.example": true,
  ".env.test.example": true,
};
const LOCAL_FILE_PATTERN =
  /(?:\.log|\.pid|\.tsbuildinfo|\.sqlite(?:3)?(?:-(?:shm|wal))?|\.db(?:-(?:shm|wal))?)$/u;

export const sourcePathAllowed = (input: {
  entry: string;
  remove: string[];
  sourceExcludes: string[];
}) => {
  if (!input.entry) {
    return true;
  }
  const segments = input.entry.split(sep);
  const basename = segments.at(-1) ?? "";
  const normalized = segments.join("/");
  if (basename === "boilerplate.receipt.json") {
    return false;
  }
  if (
    input.remove.some(
      (removed) =>
        normalized === removed || normalized.startsWith(`${removed}/`)
    ) ||
    segments.some(
      (segment) =>
        input.sourceExcludes.includes(segment) ||
        LOCAL_DIRECTORY_NAMES[segment] === true
    )
  ) {
    return false;
  }
  if (basename.startsWith(".env") && ENV_EXAMPLES[basename] !== true) {
    return false;
  }
  return !LOCAL_FILE_PATTERN.test(basename);
};

export const assertNoSelectedSymlinks = async (input: {
  remove: string[];
  sourceExcludes: string[];
  sourceRoot: string;
}) => {
  const visit = async (directory: string, prefix = ""): Promise<void> => {
    const entries = await readdir(directory, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = prefix ? join(prefix, entry.name) : entry.name;
      if (!sourcePathAllowed({ ...input, entry: relativePath })) {
        continue;
      }
      if (entry.isSymbolicLink()) {
        throw new Error(
          `Selected generator payload contains symlink: ${relativePath}`
        );
      }
      if (entry.isDirectory()) {
        await visit(join(directory, entry.name), relativePath);
      }
    }
  };
  await visit(input.sourceRoot);
};
