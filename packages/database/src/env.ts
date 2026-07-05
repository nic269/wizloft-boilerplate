import { z } from "@repo/env";

export const databaseEnv = {
	server: {
		DATABASE_URL: z.string().url(),
	},
};
