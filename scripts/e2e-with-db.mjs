import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import net from "node:net";

const DEFAULTS = {
  BETTER_AUTH_SECRET: "local-e2e-better-auth-secret-at-least-32",
  NEXT_PUBLIC_API_URL: "http://localhost:3002",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_WEB_URL: "http://localhost:3001",
};

const LINE_PATTERN = /\r?\n/;
const QUOTE_EDGE_PATTERN = /^['"]|['"]$/g;

const readDotenv = () => {
  if (!existsSync(".env")) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(".env", "utf8")
      .split(LINE_PATTERN)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line
          .slice(index + 1)
          .trim()
          .replace(QUOTE_EDGE_PATTERN, "");
        return [key, value];
      })
  );
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
    process.exit(result.status ?? 1);
  }
};

const dotenv = readDotenv();
const requestedPort = Number(
  process.env.POSTGRES_PORT ?? dotenv.POSTGRES_PORT ?? 5432
);
const postgresPort = await firstOpenPort(
  Number.isFinite(requestedPort) ? requestedPort : 5432
);
const databaseUrl = `postgresql://postgres:postgres@localhost:${postgresPort}/personal_saas_boilerplate`;

const env = {
  ...DEFAULTS,
  ...dotenv,
  ...process.env,
  BETTER_AUTH_URL:
    process.env.BETTER_AUTH_URL ??
    dotenv.BETTER_AUTH_URL ??
    `${DEFAULTS.NEXT_PUBLIC_API_URL}/api/auth`,
  DATABASE_URL: databaseUrl,
  POSTGRES_PORT: String(postgresPort),
};

console.log(`Using PostgreSQL on localhost:${postgresPort}`);

run("docker", ["compose", "up", "-d", "postgres"], env);
await waitForPort(postgresPort);
run("pnpm", ["db:generate"], env);
run("pnpm", ["db:push"], env);
run("pnpm", ["test:e2e"], env);
