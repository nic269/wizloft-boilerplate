import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const keys = () =>
  createEnv({
    emptyStringAsUndefined: true,
    runtimeEnv: process.env,
    server: {
      RESEND_API_KEY: z.string().min(1).optional(),
      RESEND_FROM_EMAIL: z.string().email().optional(),
      SMTP_URL: z.string().url().optional(),
    },
    skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
  });
