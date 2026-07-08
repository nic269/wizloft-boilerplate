import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { dirname, resolve } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const imagePrefix = `wizloft-boilerplate-${Date.now()}`;
const networkName = `${imagePrefix}-net`;
const containerNames = [];

const run = async (command, args, options = {}) => {
  const child = spawn(command, args, {
    cwd: workspaceRoot,
    stdio: options.stdio ?? "inherit",
  });

  const [code] = await once(child, "close");
  if (code !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${code}`
    );
  }
};

const runQuiet = async (command, args) => {
  const child = spawn(command, args, {
    cwd: workspaceRoot,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  const [code] = await once(child, "close");
  if (code !== 0) {
    throw new Error(stderr.trim() || stdout.trim() || `${command} failed`);
  }

  return [stdout.trim(), stderr.trim()].filter(Boolean).join("\n");
};

const findOpenPort = (start) =>
  new Promise((resolvePort, reject) => {
    const tryPort = (port) => {
      if (port > 65_535) {
        reject(new Error(`Unable to find an open port starting from ${start}`));
        return;
      }

      const server = net.createServer();
      server.unref();
      server.once("error", (error) => {
        if ("code" in error && error.code === "EADDRINUSE") {
          tryPort(port + 1);
          return;
        }
        reject(error);
      });
      server.listen(port, "127.0.0.1", () => {
        const address = server.address();
        server.close((closeError) => {
          if (closeError) {
            reject(closeError);
            return;
          }
          if (!address || typeof address === "string") {
            reject(new Error("Unable to determine an open port"));
            return;
          }
          resolvePort(address.port);
        });
      });
    };

    tryPort(start);
  });

const waitForHttp = async (url) => {
  const deadline = Date.now() + 60_000;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response;
      }
    } catch {
      // Retry until timeout while the container boots.
    }

    await delay(1000);
  }

  throw new Error(`Timed out waiting for ${url}`);
};

const describeContainerFailure = async (containerName) => {
  try {
    const inspect = await runQuiet("docker", [
      "ps",
      "-a",
      "--filter",
      `name=${containerName}`,
      "--format",
      "{{.Status}}",
    ]);
    const logs = await runQuiet("docker", ["logs", containerName]).catch(
      () => ""
    );
    return [inspect ? `status=${inspect}` : "", logs ? `logs:\n${logs}` : ""]
      .filter(Boolean)
      .join("\n");
  } catch {
    return "";
  }
};

const removeIfExists = async (kind, name) => {
  try {
    await run("docker", [kind, "rm", "-f", name], { stdio: "ignore" });
  } catch {
    // Cleanup is best-effort.
  }
};

const removeNetworkIfExists = async (name) => {
  try {
    await run("docker", ["network", "rm", name], { stdio: "ignore" });
  } catch {
    // Cleanup is best-effort.
  }
};

const removeImageIfExists = async (name) => {
  try {
    await run("docker", ["image", "rm", "-f", name], { stdio: "ignore" });
  } catch {
    // Cleanup is best-effort.
  }
};

const apiPort = await findOpenPort(3102);
const appPort = await findOpenPort(3100);
const webPort = await findOpenPort(3101);

const urls = {
  api: `http://127.0.0.1:${apiPort}`,
  app: `http://127.0.0.1:${appPort}`,
  web: `http://127.0.0.1:${webPort}`,
};

const buildArgs = [
  "API_INTERNAL_URL=http://api:3002",
  "APP_INTERNAL_URL=http://app:3000",
  `NEXT_PUBLIC_API_URL=${urls.api}`,
  `NEXT_PUBLIC_APP_URL=${urls.app}`,
  `NEXT_PUBLIC_WEB_URL=${urls.web}`,
];

const surfaces = [
  {
    containerName: `${imagePrefix}-api`,
    containerPort: "3002",
    env: [
      "PORT=3002",
      "NEXT_PUBLIC_API_URL=http://api:3002",
      `NEXT_PUBLIC_APP_URL=${urls.app}`,
      `NEXT_PUBLIC_WEB_URL=${urls.web}`,
      "BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters",
      "BETTER_AUTH_URL=http://api:3002/api/auth",
      "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/personal_saas_boilerplate",
    ],
    healthPath: "/health",
    hostPort: String(apiPort),
    imageTag: `${imagePrefix}:api`,
    name: "api",
    networkAlias: "api",
    scope: "@repo/api-app",
    target: "api-runner",
  },
  {
    containerName: `${imagePrefix}-app`,
    containerPort: "3000",
    env: [
      "PORT=3000",
      "API_INTERNAL_URL=http://api:3002",
      `NEXT_PUBLIC_API_URL=${urls.api}`,
      `NEXT_PUBLIC_APP_URL=${urls.app}`,
      `NEXT_PUBLIC_WEB_URL=${urls.web}`,
      "BETTER_AUTH_SECRET=replace-with-at-least-32-random-characters",
      "BETTER_AUTH_URL=http://api:3002/api/auth",
      "DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/personal_saas_boilerplate",
    ],
    healthPath: "/sign-in",
    hostPort: String(appPort),
    imageTag: `${imagePrefix}:app`,
    name: "app",
    networkAlias: "app",
    scope: "@repo/app",
    target: "app-runner",
  },
  {
    containerName: `${imagePrefix}-web`,
    containerPort: "3001",
    env: [
      "PORT=3001",
      `NEXT_PUBLIC_API_URL=${urls.api}`,
      `NEXT_PUBLIC_APP_URL=${urls.app}`,
      `NEXT_PUBLIC_WEB_URL=${urls.web}`,
    ],
    healthPath: "/",
    hostPort: String(webPort),
    imageTag: `${imagePrefix}:web`,
    name: "web",
    networkAlias: "web",
    scope: "@repo/web",
    target: "web-runner",
  },
];

try {
  await runQuiet("docker", ["version"]);

  await removeNetworkIfExists(networkName);
  await run("docker", ["network", "create", networkName]);

  for (const surface of surfaces) {
    const args = [
      "build",
      "--target",
      surface.target,
      "--build-arg",
      `APP_SCOPE=${surface.scope}`,
      "-t",
      surface.imageTag,
    ];

    for (const buildArg of buildArgs) {
      args.push("--build-arg", buildArg);
    }

    args.push(".");
    await run("docker", args);
  }

  const [apiSurface] = surfaces;
  await removeIfExists("container", apiSurface.containerName);
  await run("docker", [
    "run",
    "--detach",
    "--name",
    apiSurface.containerName,
    "--network",
    networkName,
    "--network-alias",
    apiSurface.networkAlias,
    "--publish",
    `${apiSurface.hostPort}:${apiSurface.containerPort}`,
    ...apiSurface.env.flatMap((entry) => ["--env", entry]),
    apiSurface.imageTag,
  ]);
  containerNames.push(apiSurface.containerName);
  try {
    await waitForHttp(`${urls.api}${apiSurface.healthPath}`);
  } catch (error) {
    const details = await describeContainerFailure(apiSurface.containerName);
    throw new Error(
      `${error instanceof Error ? error.message : String(error)}${
        details ? `\n${details}` : ""
      }`
    );
  }

  for (const surface of surfaces.slice(1)) {
    await removeIfExists("container", surface.containerName);
    await run("docker", [
      "run",
      "--detach",
      "--name",
      surface.containerName,
      "--network",
      networkName,
      "--network-alias",
      surface.networkAlias,
      "--publish",
      `${surface.hostPort}:${surface.containerPort}`,
      ...surface.env.flatMap((entry) => ["--env", entry]),
      surface.imageTag,
    ]);
    containerNames.push(surface.containerName);
    try {
      await waitForHttp(
        `${surface.name === "web" ? urls.web : urls.app}${surface.healthPath}`
      );
    } catch (error) {
      const details = await describeContainerFailure(surface.containerName);
      throw new Error(
        `${error instanceof Error ? error.message : String(error)}${
          details ? `\n${details}` : ""
        }`
      );
    }
  }

  console.log("Production container validation passed.");
  console.log(`API: ${urls.api}/health`);
  console.log(`App: ${urls.app}/sign-in`);
  console.log(`Web: ${urls.web}/`);
} finally {
  for (const containerName of containerNames.reverse()) {
    await removeIfExists("container", containerName);
  }
  await removeNetworkIfExists(networkName);
  for (const surface of surfaces) {
    await removeImageIfExists(surface.imageTag);
  }
}
