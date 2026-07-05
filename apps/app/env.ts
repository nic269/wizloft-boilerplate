import { createEnv, z } from "@repo/env";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		API_INTERNAL_URL: z.string().url().optional(),
	},
	client: {
		NEXT_PUBLIC_APP_URL: z.string().url(),
		NEXT_PUBLIC_WEB_URL: z.string().url(),
		NEXT_PUBLIC_API_URL: z.string().url(),
	},
});
