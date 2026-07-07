import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { generateProject, loadManifest } from "./generator.ts";

const sourceRoot = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const args = process.argv.slice(2);

const usage = () => `Usage: pnpm boilerplate:init <target> [options]

Options:
  --name <display-name>   Set the product display name
  --apps <list>           Comma-separated apps; app and api are required
  --with-docs             Add the optional docs app
  --skip-install          Do not run pnpm install
  --validate              Run the full generated-project validation ladder
  --help                  Show this help

Future public command: wizloft boilerplate init <target>
`;

const takeValue = (flag: string) => {
  const index = args.indexOf(flag);
  if (index === -1) {
    return;
  }
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${flag} requires a value.`);
  }
  args.splice(index, 2);
  return value;
};

if (args.includes("--help")) {
  console.log(usage());
  process.exit(0);
}

const appName = takeValue("--name") ?? "";
const appsValue = takeValue("--apps");
const withDocsIndex = args.indexOf("--with-docs");
const withDocs = withDocsIndex !== -1;
if (withDocs) {
  args.splice(withDocsIndex, 1);
}
const skipInstallIndex = args.indexOf("--skip-install");
const skipInstall = skipInstallIndex !== -1;
if (skipInstall) {
  args.splice(skipInstallIndex, 1);
}
const validateIndex = args.indexOf("--validate");
const validate = validateIndex !== -1;
if (validate) {
  args.splice(validateIndex, 1);
}

const target = args.shift();
if (!target || args.length > 0) {
  console.error(usage());
  process.exit(1);
}

const manifest = await loadManifest(sourceRoot);
const selectedApps = appsValue
  ? appsValue
      .split(",")
      .map((app) => app.trim())
      .filter(Boolean)
  : [...manifest.defaultApps];
if (withDocs && !selectedApps.includes("docs")) {
  selectedApps.push("docs");
}

const result = await generateProject({
  appName,
  apps: selectedApps,
  install: !skipInstall,
  sourceRoot,
  target,
  validate,
});

console.log(`Created ${result.appName} at ${result.target}`);
console.log(`Apps: ${result.selectedApps.join(", ")}`);
