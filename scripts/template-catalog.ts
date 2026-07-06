import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { templateTracks } from "../packages/config/src/templates.ts";

const root = process.cwd();

const command = process.argv[2] ?? "list";

const getTemplateFolders = () =>
  readdirSync(join(root, "templates"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

const validate = () => {
  const folders = getTemplateFolders();
  const slugs = templateTracks.map((template) => template.slug).sort();
  const errors: string[] = [];

  for (const slug of slugs) {
    const readmePath = join(root, "templates", slug, "README.md");
    if (!existsSync(readmePath)) {
      errors.push(`Missing README.md for templates/${slug}`);
    }
  }

  for (const slug of slugs) {
    if (!folders.includes(slug)) {
      errors.push(`Catalog references missing template folder: templates/${slug}`);
    }
  }

  for (const folder of folders) {
    if (!slugs.includes(folder)) {
      errors.push(`Template folder is missing from catalog: templates/${folder}`);
    }
  }

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(`Template catalog valid: ${slugs.length} tracks.`);
};

const list = () => {
  for (const template of templateTracks) {
    console.log(`${template.path} - ${template.summary}`);
  }
};

const printJson = () => {
  console.log(JSON.stringify(templateTracks, null, 2));
};

switch (command) {
  case "list":
    list();
    break;
  case "json":
    printJson();
    break;
  case "validate":
    validate();
    break;
  default:
    console.error("Usage: pnpm templates:list | pnpm templates:json | pnpm templates:validate");
    process.exitCode = 1;
}
