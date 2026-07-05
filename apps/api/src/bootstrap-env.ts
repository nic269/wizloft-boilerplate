if (process.env.NODE_ENV !== "production") {
	process.env.NEXT_PUBLIC_API_URL ??= "http://localhost:3002";
	process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/personal_saas_boilerplate";
	process.env.BETTER_AUTH_SECRET ??= "development-secret-at-least-32-characters";
	process.env.BETTER_AUTH_URL ??= "http://localhost:3002/api/auth";
	process.env.NEXT_PUBLIC_APP_URL ??= "http://localhost:3000";
	process.env.NEXT_PUBLIC_WEB_URL ??= "http://localhost:3001";
}
