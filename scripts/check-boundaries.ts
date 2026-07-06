import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative } from "node:path";

const root = process.cwd();
const sourceExtensions = new Set([".ts", ".tsx", ".js", ".jsx"]);
const violations: string[] = [];

const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter((entry) => !["node_modules", ".next", ".turbo", "dist", "build"].includes(entry.name))
      .map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : Promise.resolve([path]);
      }),
  );
  return files.flat();
};

const sourceFiles = (await walk(root)).filter((file) => sourceExtensions.has(extname(file)));

for (const file of sourceFiles) {
  const rel = relative(root, file);
  const contents = await readFile(file, "utf8");
  const appMatch = rel.match(/^apps\/([^/]+)\//);

  if (appMatch && /from\s+["']\.\.\/\.\.\/[^"']*apps\//.test(contents)) {
    violations.push(`${rel}: apps must not import from other apps`);
  }

  if (rel.startsWith("packages/") && /from\s+["'][^"']*apps\//.test(contents)) {
    violations.push(`${rel}: packages must not import from apps`);
  }
}

if (violations.length > 0) {
  console.error(violations.join("\n"));
  process.exit(1);
}

console.log("Boundary check passed.");
