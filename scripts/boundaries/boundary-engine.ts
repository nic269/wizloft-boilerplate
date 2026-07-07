import type { Dirent } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve, sep } from "node:path";
import ts from "typescript";

interface BoundaryConfig {
  packageRules: Record<string, string[]>;
  serverOnlyPackages: Record<string, string[]>;
}

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  exports?: Record<string, string>;
  name: string;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

interface Workspace {
  dependencies: Set<string>;
  directory: string;
  exports: string[];
  kind: "app" | "package";
  name: string;
  runtimeDependencies: Set<string>;
}

export interface BoundaryViolation {
  code:
    | "app-imports-app"
    | "client-imports-server"
    | "dependency-cycle"
    | "layer-violation"
    | "package-imports-app"
    | "private-deep-import"
    | "undeclared-workspace-dependency";
  file?: string;
  message: string;
}

const SOURCE_EXTENSIONS = new Set([".js", ".jsx", ".mjs", ".ts", ".tsx"]);
const IGNORED_DIRECTORIES = new Set([
  ".next",
  ".turbo",
  "build",
  "dist",
  "node_modules",
  "storybook-static",
]);

const walk = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries
      .filter(
        (entry) => !(entry.isDirectory() && IGNORED_DIRECTORIES.has(entry.name))
      )
      .map((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? walk(path) : Promise.resolve([path]);
      })
  );
  return files.flat();
};

const loadWorkspace = async (
  directory: string,
  kind: Workspace["kind"]
): Promise<Workspace | undefined> => {
  try {
    const manifest = JSON.parse(
      await readFile(join(directory, "package.json"), "utf8")
    ) as PackageManifest;
    const runtimeDependencyNames = [
      ...Object.keys(manifest.dependencies ?? {}),
      ...Object.keys(manifest.optionalDependencies ?? {}),
      ...Object.keys(manifest.peerDependencies ?? {}),
    ];
    return {
      dependencies: new Set([
        ...runtimeDependencyNames,
        ...Object.keys(manifest.devDependencies ?? {}),
      ]),
      directory,
      exports: Object.keys(manifest.exports ?? {}),
      kind,
      name: manifest.name,
      runtimeDependencies: new Set(runtimeDependencyNames),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return;
    }
    throw error;
  }
};

const loadWorkspaces = async (root: string) => {
  const workspaces: Workspace[] = [];
  for (const [parent, kind] of [
    ["apps", "app"],
    ["packages", "package"],
  ] as const) {
    const parentPath = join(root, parent);
    let entries: Dirent[];
    try {
      entries = await readdir(parentPath, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }
      const directory = join(parentPath, entry.name);
      const workspace = await loadWorkspace(directory, kind);
      if (workspace) {
        workspaces.push(workspace);
      }
    }
  }
  return workspaces;
};

const scriptKind = (file: string) =>
  file.endsWith(".tsx") || file.endsWith(".jsx")
    ? ts.ScriptKind.TSX
    : ts.ScriptKind.TS;

const literalText = (node: ts.Node | undefined) =>
  node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node))
    ? node.text
    : undefined;

const importedSpecifier = (node: ts.Node) => {
  if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
    return literalText(node.moduleSpecifier);
  }
  if (ts.isCallExpression(node)) {
    const dynamicImport = node.expression.kind === ts.SyntaxKind.ImportKeyword;
    const requireCall =
      ts.isIdentifier(node.expression) && node.expression.text === "require";
    return dynamicImport || requireCall
      ? literalText(node.arguments[0])
      : undefined;
  }
  if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
    return literalText(node.argument.literal);
  }
};

const sourceImports = (file: string, contents: string) => {
  const sourceFile = ts.createSourceFile(
    file,
    contents,
    ts.ScriptTarget.Latest,
    true,
    scriptKind(file)
  );
  const imports = new Set<string>();
  const visit = (node: ts.Node) => {
    const specifier = importedSpecifier(node);
    if (specifier) {
      imports.add(specifier);
    }
    ts.forEachChild(node, visit);
  };
  visit(sourceFile);
  const [firstStatement] = sourceFile.statements;
  const clientComponent = Boolean(
    firstStatement &&
      ts.isExpressionStatement(firstStatement) &&
      literalText(firstStatement.expression) === "use client"
  );
  return { clientComponent, imports: [...imports] };
};

const containsPath = (parent: string, child: string) => {
  const rel = relative(parent, child);
  return rel === "" || !(rel === ".." || rel.startsWith(`..${sep}`));
};

const resolveWorkspaceImport = (
  specifier: string,
  file: string,
  workspaces: Workspace[]
) => {
  if (specifier.startsWith(".")) {
    const target = resolve(dirname(file), specifier);
    return workspaces.find((workspace) =>
      containsPath(workspace.directory, target)
    );
  }
  return workspaces.find(
    (workspace) =>
      specifier === workspace.name || specifier.startsWith(`${workspace.name}/`)
  );
};

const exportSubpath = (specifier: string, workspaceName: string) =>
  specifier === workspaceName
    ? "."
    : `.${specifier.slice(workspaceName.length)}`;

const exportMatches = (requested: string, exported: string) => {
  if (!exported.includes("*")) {
    return requested === exported;
  }
  const [prefix, suffix = ""] = exported.split("*");
  return requested.startsWith(prefix ?? "") && requested.endsWith(suffix);
};

const cycleViolations = (workspaces: Workspace[]) => {
  const byName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace])
  );
  const visited = new Set<string>();
  const active = new Set<string>();
  const stack: string[] = [];
  const cycles = new Set<string>();

  const visit = (name: string) => {
    if (active.has(name)) {
      const start = stack.indexOf(name);
      const cycle = [...stack.slice(start), name];
      cycles.add(cycle.join(" -> "));
      return;
    }
    if (visited.has(name)) {
      return;
    }
    visited.add(name);
    active.add(name);
    stack.push(name);
    const workspace = byName.get(name);
    for (const dependency of workspace?.runtimeDependencies ?? []) {
      if (byName.has(dependency)) {
        visit(dependency);
      }
    }
    stack.pop();
    active.delete(name);
  };

  for (const workspace of workspaces) {
    visit(workspace.name);
  }
  return [...cycles].map<BoundaryViolation>((cycle) => ({
    code: "dependency-cycle",
    message: `Workspace dependency cycle detected: ${cycle}`,
  }));
};

const manifestViolations = (
  workspaces: Workspace[],
  config: BoundaryConfig,
  root: string
) => {
  const byName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace])
  );
  const violations: BoundaryViolation[] = [];
  for (const owner of workspaces) {
    for (const dependencyName of owner.dependencies) {
      const target = byName.get(dependencyName);
      if (!target) {
        continue;
      }
      const file = relative(root, join(owner.directory, "package.json"));
      if (owner.kind === "app" && target.kind === "app" && owner !== target) {
        violations.push({
          code: "app-imports-app",
          file,
          message: `${owner.name} must not depend on ${target.name}`,
        });
      }
      if (owner.kind === "package" && target.kind === "app") {
        violations.push({
          code: "package-imports-app",
          file,
          message: `${owner.name} must not depend on app workspace ${target.name}`,
        });
      }
      const allowedDependencies = config.packageRules[owner.name];
      if (
        owner.kind === "package" &&
        target.kind === "package" &&
        owner.runtimeDependencies.has(target.name) &&
        allowedDependencies &&
        !allowedDependencies.includes(target.name)
      ) {
        violations.push({
          code: "layer-violation",
          file,
          message: `${owner.name} is not allowed to depend on ${target.name}`,
        });
      }
    }
  }
  return violations;
};

const inspectImport = (input: {
  clientComponent: boolean;
  config: BoundaryConfig;
  file: string;
  owner: Workspace;
  specifier: string;
  target: Workspace;
}) => {
  const { clientComponent, config, file, owner, specifier, target } = input;
  const violations: BoundaryViolation[] = [];
  const filePath = file;
  if (owner.kind === "app" && target.kind === "app" && owner !== target) {
    violations.push({
      code: "app-imports-app",
      file: filePath,
      message: `${owner.name} must not import ${target.name}`,
    });
  }
  if (owner.kind === "package" && target.kind === "app") {
    violations.push({
      code: "package-imports-app",
      file: filePath,
      message: `${owner.name} must not import app workspace ${target.name}`,
    });
  }
  if (!owner.dependencies.has(target.name) && owner !== target) {
    violations.push({
      code: "undeclared-workspace-dependency",
      file: filePath,
      message: `${owner.name} imports ${target.name} without declaring it in package.json`,
    });
  }
  if (!specifier.startsWith(".") && target.kind === "package") {
    const requested = exportSubpath(specifier, target.name);
    if (!target.exports.some((entry) => exportMatches(requested, entry))) {
      violations.push({
        code: "private-deep-import",
        file: filePath,
        message: `${specifier} is not exported by ${target.name}`,
      });
    }
    const clientEntrypoints = config.serverOnlyPackages[target.name];
    if (
      clientComponent &&
      clientEntrypoints &&
      !clientEntrypoints.some((entry) => exportMatches(requested, entry))
    ) {
      violations.push({
        code: "client-imports-server",
        file: filePath,
        message: `Client Component imports server-only entrypoint ${specifier}`,
      });
    }
  }
  const allowedDependencies = config.packageRules[owner.name];
  if (
    owner.kind === "package" &&
    target.kind === "package" &&
    owner !== target &&
    allowedDependencies &&
    !allowedDependencies.includes(target.name)
  ) {
    violations.push({
      code: "layer-violation",
      file: filePath,
      message: `${owner.name} is not allowed to import ${target.name}`,
    });
  }
  return violations;
};

export const checkBoundaries = async (input: {
  configPath: string;
  root: string;
}) => {
  const root = resolve(input.root);
  const config = JSON.parse(
    await readFile(input.configPath, "utf8")
  ) as BoundaryConfig;
  const workspaces = await loadWorkspaces(root);
  const violations = [
    ...cycleViolations(workspaces),
    ...manifestViolations(workspaces, config, root),
  ];

  for (const owner of workspaces) {
    const files = (await walk(owner.directory)).filter((file) =>
      SOURCE_EXTENSIONS.has(extname(file))
    );
    for (const file of files) {
      const contents = await readFile(file, "utf8");
      const { clientComponent, imports } = sourceImports(file, contents);
      for (const specifier of imports) {
        const target = resolveWorkspaceImport(specifier, file, workspaces);
        if (!target) {
          continue;
        }
        violations.push(
          ...inspectImport({
            clientComponent,
            config,
            file: relative(root, file),
            owner,
            specifier,
            target,
          })
        );
      }
    }
  }

  return violations.sort((left, right) =>
    `${left.file ?? ""}:${left.code}:${left.message}`.localeCompare(
      `${right.file ?? ""}:${right.code}:${right.message}`
    )
  );
};
