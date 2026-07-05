import { createEnv, z } from "@repo/env";

export const env = createEnv({
	client: {
		NEXT_PUBLIC_WEB_URL: z.string().url(),
		NEXT_PUBLIC_APP_URL: z.string().url(),
		NEXT_PUBLIC_API_URL: z.string().url(),
	},
});
