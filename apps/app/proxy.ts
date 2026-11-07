import { createAuthGuard } from "@repo/auth/middleware";

export default createAuthGuard({
  protectedPaths: ["/dashboard", "/settings"],
  signIn: "/sign-in",
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
