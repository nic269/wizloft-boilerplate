import { serve } from "@hono/node-server";
import { createApiApp } from "@repo/api";
import { env } from "../env";

const app = createApiApp();
const port = Number(
  new URL(env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002").port || 3002
);

serve({ fetch: app.fetch, port });

console.log(`API listening on http://localhost:${port}`);
