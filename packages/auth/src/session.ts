import type { AuthSession } from "./server";

export type SessionUser = AuthSession["user"];

export const isAuthenticated = (session: AuthSession | null | undefined): session is AuthSession =>
	Boolean(session?.user);
