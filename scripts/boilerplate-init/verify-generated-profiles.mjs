import { spawn, spawnSync } from "node:child_process";
import { once } from "node:events";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import net from "node:net";
import { dirname, join, resolve } from "node:path";
import process from "node:process";
import { setTimeout as delay } from "node:timers/promises";
import { parseEnv } from "node:util";
import { generateProject } from "./generator.ts";

const sourceRoot = resolve(import.meta.dirname, "../..");
const DOCS_API_LINK_PATTERN = /href="https?:\/\/[^"]+\/docs\/api"/u;
const optionalApps = ["web", "docs", "email", "storybook"];
const usage = `Usage: pnpm profiles:verify (--full | --case <profile>:<apps>) [options]

Options:
  --full                  Verify all 32 profile/app combinations
  --case <profile>:<apps> Verify one combination; repeatable (example: core:app,api)
  --runtime               Run release, database/browser, and container proof for --case
  --root <path>           Use a specific new directory for generated targets
  --report <path>         Write the JSON report at this path
  --keep                  Keep generated targets after verification
  --help                  Show this help
`;

const args = process.argv.slice(2);
const takeValue = (flag) => {
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
const takeValues = (flag) => {
  const values = [];
  while (args.includes(flag)) {
    values.push(takeValue(flag));
  }
  return values;
};

if (args.includes("--help")) {
  console.log(usage);
  process.exit(0);
}
const fullIndex = args.indexOf("--full");
const full = fullIndex !== -1;
if (full) {
  args.splice(fullIndex, 1);
}
const keepIndex = args.indexOf("--keep");
const keep = keepIndex !== -1;
if (keep) {
  args.splice(keepIndex, 1);
}
const runtimeIndex = args.indexOf("--runtime");
const runtime = runtimeIndex !== -1;
if (runtime) {
  args.splice(runtimeIndex, 1);
}
const caseValues = takeValues("--case");
const rootOption = takeValue("--root");
const reportOption = takeValue("--report");
if (args.length > 0 || full === caseValues.length > 0 || (full && runtime)) {
  throw new Error(usage);
}

const appSets = [[]];
for (const app of optionalApps) {
  const count = appSets.length;
  for (let index = 0; index < count; index += 1) {
    appSets.push([...(appSets[index] ?? []), app]);
  }
}
const cases = full
  ? ["saas", "core"].flatMap((profile) =>
      appSets.map((optional) => ({
        apps: ["app", "api", ...optional],
        profile,
      }))
    )
  : caseValues.map((value) => {
      const separator = value.indexOf(":");
      if (separator === -1) {
        throw new Error(`Invalid --case value: ${value}`);
      }
      return {
        apps: value
          .slice(separator + 1)
          .split(",")
          .map((app) => app.trim())
          .filter(Boolean),
        profile: value.slice(0, separator),
      };
    });

const timestamp = new Date().toISOString().replaceAll(/[:.]/gu, "-");
const root = resolve(
  rootOption ?? `/tmp/wizloft-generated-profile-verification-${timestamp}`
);
const reportPath = resolve(
  reportOption ??
    join(sourceRoot, ".data", `profile-verification-${timestamp}.json`)
);
const run = (command, commandArgs, cwd) =>
  new Promise((resolvePromise, reject) => {
    const child = spawn(command, commandArgs, { cwd, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => {
      if (code === 0) {
        resolvePromise();
      } else {
        reject(
          new Error(
            `Command failed (${code ?? "unknown"}): ${command} ${commandArgs.join(" ")}`
          )
        );
      }
    });
  });
const findOpenPort = () =>
  new Promise((resolvePort, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close((error) => {
        if (error) {
          reject(error);
        } else if (!address || typeof address === "string") {
          reject(new Error("Could not resolve the docs smoke port."));
        } else {
          resolvePort(address.port);
        }
      });
    });
  });

const runDocsSmoke = async (target) => {
  const port = await findOpenPort();
  const generatedEnvironment = parseEnv(
    await readFile(join(target, ".env"), "utf8")
  );
  const child = spawn("corepack", ["pnpm", "--filter", "@repo/docs", "start"], {
    cwd: target,
    env: { ...process.env, ...generatedEnvironment, PORT: String(port) },
    stdio: "inherit",
  });
  try {
    const deadline = Date.now() + 60_000;
    while (Date.now() < deadline) {
      if (child.exitCode !== null) {
        throw new Error(
          `Generated docs server exited with code ${child.exitCode}.`
        );
      }
      try {
        const response = await fetch(`http://127.0.0.1:${port}`);
        if (response.ok) {
          const html = await response.text();
          if (!DOCS_API_LINK_PATTERN.test(html)) {
            throw new Error(
              "Generated docs did not render the API documentation link."
            );
          }
          return;
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes("did not render")
        ) {
          throw error;
        }
      }
      await delay(500);
    }
    throw new Error("Timed out waiting for the generated docs server.");
  } finally {
    if (child.exitCode === null) {
      child.kill("SIGTERM");
      await Promise.race([once(child, "close"), delay(5000)]);
    }
    if (child.exitCode === null) {
      child.kill("SIGKILL");
      await once(child, "close");
    }
  }
};

const commandSet = runtime
  ? [
      ["corepack", "pnpm", "release:check"],
      ["corepack", "pnpm", "test:e2e:db"],
      ["corepack", "pnpm", "docker:validate"],
    ]
  : [
      ["corepack", "pnpm", "check:ci"],
      ["corepack", "pnpm", "check-types"],
      ["corepack", "pnpm", "boundaries"],
      ["corepack", "pnpm", "build"],
    ];
const report = {
  cases: [],
  commands: commandSet.map((command) => command.join(" ")),
  finishedAt: null,
  keep,
  node: process.version,
  pnpm: spawnSync("corepack", ["pnpm", "--version"], {
    encoding: "utf8",
  }).stdout.trim(),
  root,
  runtime,
  sourceRoot,
  startedAt: new Date().toISOString(),
};
const infrastructureErrors = [];
const writeReport = async () => {
  try {
    await mkdir(dirname(reportPath), { recursive: true });
    await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  } catch (error) {
    infrastructureErrors.push(error);
  }
};

await mkdir(root, { recursive: false });
try {
  for (const [index, selected] of cases.entries()) {
    const name = `${selected.profile}-${String(index + 1).padStart(2, "0")}`;
    const target = join(root, name);
    const result = {
      apps: selected.apps,
      error: null,
      finishedAt: null,
      profile: selected.profile,
      startedAt: new Date().toISOString(),
      status: "running",
      target,
    };
    report.cases.push(result);
    try {
      await generateProject({
        appName: `Verification ${name}`,
        apps: selected.apps,
        install: true,
        profile: selected.profile,
        sourceRoot,
        target,
        validate: false,
      });
      for (const [command, ...commandArgs] of commandSet) {
        await run(command, commandArgs, target);
      }
      if (runtime && selected.apps.includes("docs")) {
        await runDocsSmoke(target);
      }
      result.status = "passed";
    } catch (error) {
      result.status = "failed";
      result.error = error instanceof Error ? error.message : String(error);
    } finally {
      result.finishedAt = new Date().toISOString();
      if (!keep) {
        try {
          await rm(target, { force: true, recursive: true });
        } catch (error) {
          result.status = "failed";
          result.error = [result.error, `Cleanup failed: ${String(error)}`]
            .filter(Boolean)
            .join("\n");
        }
      }
      await writeReport();
    }
  }
} finally {
  report.finishedAt = new Date().toISOString();
  if (!keep) {
    try {
      await rm(root, { force: true, recursive: true });
    } catch (error) {
      infrastructureErrors.push(error);
    }
  }
  await writeReport();
}

const failures = report.cases.filter((result) => result.status !== "passed");
console.log(`Profile verification report: ${reportPath}`);
console.log(
  `Passed ${report.cases.length - failures.length}/${report.cases.length} cases.`
);
if (failures.length > 0) {
  process.exitCode = 1;
}
if (infrastructureErrors.length > 0) {
  throw new AggregateError(
    infrastructureErrors,
    "Profile verification reporting or cleanup failed"
  );
}
