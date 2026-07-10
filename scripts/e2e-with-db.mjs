import { spawnSync } from "node:child_process";
import net from "node:net";

const DEFAULTS = {
  API_INTERNAL_URL: "http://localhost:3002",
  BETTER_AUTH_SECRET: "local-e2e-better-auth-secret-at-least-32",
  BETTER_AUTH_URL: "http://localhost:3002/api/auth",
  NEXT_PUBLIC_API_URL: "http://localhost:3002",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_WEB_URL: "http://localhost:3001",
  PLAYWRIGHT_REUSE_SERVER: "false",
};

const isPortInUse = (port) =>
  new Promise((resolve) => {
    const socket = net.connect({ host: "127.0.0.1", port, timeout: 1000 });
    socket.once("connect", () => {
      socket.destroy();
      resolve(true);
    });
    socket.once("timeout", () => {
      socket.destroy();
      resolve(false);
    });
    socket.once("error", () => resolve(false));
  });

const firstOpenPort = async (start) => {
  for (let port = start; port < start + 50; port += 1) {
    if (!(await isPortInUse(port))) {
      return port;
    }
  }

  throw new Error(
    `No open PostgreSQL port found from ${start} to ${start + 49}.`
  );
};

const waitForPort = async (port, timeoutMs = 45_000) => {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const ready = await new Promise((resolve) => {
      const socket = net.connect({ host: "127.0.0.1", port, timeout: 1000 });
      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });
      socket.once("timeout", () => {
        socket.destroy();
        resolve(false);
      });
      socket.once("error", () => resolve(false));
    });

    if (ready) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(
    `PostgreSQL did not accept TCP connections on localhost:${port}.`
  );
};

const run = (command, args, commandEnv) => {
  const result = spawnSync(command, args, {
    env: commandEnv,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(" ")} failed with exit code ${result.status ?? 1}`
    );
  }
};

const requestedPort = Number(process.env.POSTGRES_PORT ?? 5432);
const postgresPort = await firstOpenPort(
  Number.isFinite(requestedPort) ? requestedPort : 5432
);
const databaseUrl = `postgresql://postgres:postgres@localhost:${postgresPort}/personal_saas_boilerplate`;

const env = {
  ...DEFAULTS,
  ...process.env,
  DATABASE_URL: databaseUrl,
  POSTGRES_PORT: String(postgresPort),
};
const composeProject = `wizloft-e2e-${process.pid}`;

console.log(`Using PostgreSQL on localhost:${postgresPort}`);

let primaryError;
let cleanupError;
try {
  run(
    "docker",
    ["compose", "--project-name", composeProject, "up", "-d", "postgres"],
    env
  );
  await waitForPort(postgresPort);
  run("pnpm", ["db:generate"], env);
  run("pnpm", ["db:migrate:deploy"], env);
  run("pnpm", ["--filter", "@repo/auth", "test:integration"], env);
  run("pnpm", ["test:e2e"], env);
} catch (error) {
  primaryError = error;
} finally {
  try {
    run(
      "docker",
      [
        "compose",
        "--project-name",
        composeProject,
        "down",
        "--volumes",
        "--remove-orphans",
      ],
      env
    );
  } catch (error) {
    cleanupError = error;
  }
}

if (primaryError) {
  if (cleanupError) {
    console.error("E2E database cleanup also failed:", cleanupError);
  }
  throw primaryError;
}
if (cleanupError) {
  throw cleanupError;
}
