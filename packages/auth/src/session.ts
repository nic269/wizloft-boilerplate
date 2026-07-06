import { type AuthSession, auth } from "./server";

export type SessionUser = AuthSession["user"];

export const isAuthenticated = (session: AuthSession | null | undefined): session is AuthSession =>
  Boolean(session?.user);

export const getCurrentSession = async (headers: Headers) => auth.api.getSession({ headers });
