import { prisma } from "@repo/database";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const isProduction = process.env.NODE_ENV === "production";

export const auth = betterAuth({
	database: prismaAdapter(prisma, { provider: "postgresql" }),
	basePath: "/api/auth",
	baseURL: process.env.BETTER_AUTH_URL ?? (isProduction ? undefined : "http://localhost:3002/api/auth"),
	secret: process.env.BETTER_AUTH_SECRET ?? (isProduction ? undefined : "development-secret-at-least-32-characters"),
	trustedOrigins: [
		process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
		process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3001",
	].filter(Boolean) as string[],
	emailAndPassword: {
		enabled: true,
		autoSignIn: true,
		minPasswordLength: 8,
		maxPasswordLength: 128,
	},
	socialProviders: googleEnabled
		? {
				google: {
					clientId: process.env.GOOGLE_CLIENT_ID as string,
					clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
				},
			}
		: undefined,
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
});

export type Auth = typeof auth;
export type AuthSession = typeof auth.$Infer.Session;
