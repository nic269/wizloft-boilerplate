import { authEnv } from "@repo/auth/env";
import { databaseEnv } from "@repo/database/env";
import { createEnv, z } from "@repo/env";

const developmentDefaults = {
	NEXT_PUBLIC_API_URL: "http://localhost:3002",
	DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/personal_saas_boilerplate",
	BETTER_AUTH_SECRET: "development-secret-at-least-32-characters",
	BETTER_AUTH_URL: "http://localhost:3002/api/auth",
};

if (process.env.NODE_ENV !== "production") {
	for (const [key, value] of Object.entries(developmentDefaults)) {
		process.env[key] ??= value;
	}
}

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		NEXT_PUBLIC_API_URL: z.string().url(),
		...databaseEnv.server,
		...authEnv.server,
	},
});
