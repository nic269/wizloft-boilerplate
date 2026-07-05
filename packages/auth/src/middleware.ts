import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const createAuthGuard = (paths: { signIn: string; dashboard: string }) => {
	return (request: NextRequest) => {
		const sessionCookie = request.cookies.get("better-auth.session_token");
		const isProtected = request.nextUrl.pathname.startsWith(paths.dashboard);

		if (isProtected && !sessionCookie) {
			return NextResponse.redirect(new URL(paths.signIn, request.url));
		}

		return NextResponse.next();
	};
};
