import { NextResponse } from "next/server";

type AuthGuardRequest = Request & {
  nextUrl?: URL;
  cookies?: {
    get: (name: string) => unknown;
  };
};

const sessionCookieNames = [
  "better-auth.session_token",
  "__Secure-better-auth.session_token",
] as const;

const hasSessionCookie = (request: AuthGuardRequest) =>
  sessionCookieNames.some((name) => {
    if (request.cookies?.get(name)) {
      return true;
    }

    const cookieHeader = request.headers.get("cookie") ?? "";
    return cookieHeader
      .split(";")
      .some((cookie) => cookie.trim().startsWith(`${name}=`));
  });

const matchesPathPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/**
 * Optimistic edge redirect for signed-out visitors. Pages must still verify
 * the session server-side; this only avoids rendering protected routes.
 */
export const createAuthGuard =
  (paths: { protectedPaths: readonly string[]; signIn: string }) =>
  (request: AuthGuardRequest) => {
    const url = request.nextUrl ?? new URL(request.url);
    const isProtected = paths.protectedPaths.some((prefix) =>
      matchesPathPrefix(url.pathname, prefix)
    );

    if (isProtected && !hasSessionCookie(request)) {
      const signInUrl = new URL(paths.signIn, request.url);
      signInUrl.searchParams.set("callbackUrl", `${url.pathname}${url.search}`);
      return NextResponse.redirect(signInUrl);
    }

    return NextResponse.next();
  };
