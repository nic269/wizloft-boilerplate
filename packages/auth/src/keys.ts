import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const PLACEHOLDER_SECRET_PREFIX = "replace-with";

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: process.env,
    server: {
      BETTER_AUTH_SECRET: z.string().min(32),
      BETTER_AUTH_URL: z.string().url(),
      GOOGLE_CLIENT_ID: z.string().min(1).optional(),
      GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
      NEXT_PUBLIC_APP_URL: z.string().url(),
      NEXT_PUBLIC_WEB_URL: z.string().url(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });

/**
 * Refuses to start a production server with the example secret. Called at
 * server startup rather than in env validation, because `next build` also runs
 * with NODE_ENV=production and must work with local example values.
 */
export const assertProductionAuthSecret = (
  secret: string | undefined = process.env.BETTER_AUTH_SECRET,
  nodeEnv: string | undefined = process.env.NODE_ENV
) => {
  if (
    nodeEnv === "production" &&
    secret?.startsWith(PLACEHOLDER_SECRET_PREFIX)
  ) {
    throw new Error(
      "BETTER_AUTH_SECRET still uses the example placeholder. Generate one with `openssl rand -base64 32`."
    );
  }
};
