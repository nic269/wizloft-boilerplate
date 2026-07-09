import { rm } from "node:fs/promises";
import { build } from "esbuild";

await rm("dist", { force: true, recursive: true });

await build({
  bundle: true,
  entryPoints: ["src/index.ts"],
  format: "cjs",
  logLevel: "info",
  outfile: "dist/index.cjs",
  platform: "node",
  sourcemap: true,
  target: "node22",
});
