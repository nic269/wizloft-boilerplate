import { createAuthGuard } from "@repo/auth/middleware";

export default createAuthGuard({ signIn: "/sign-in", dashboard: "/dashboard" });

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*"],
};
