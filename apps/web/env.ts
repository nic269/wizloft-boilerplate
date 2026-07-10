import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_API_URL: z.string().url(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_DOCS_URL: z.string().url().optional(),
    NEXT_PUBLIC_WEB_URL: z.string().url(),
  },
  emptyStringAsUndefined: true,
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL,
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
  },
  skipValidation: process.env.SKIP_ENV_VALIDATION === "true",
});
