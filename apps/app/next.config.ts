import type { NextConfig } from "next";
import { env } from "./env";

const apiUrl = env.API_INTERNAL_URL ?? env.NEXT_PUBLIC_API_URL;

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: [
    "@repo/api",
    "@repo/auth",
    "@repo/config",
    "@repo/design-system",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
  ],
  async rewrites() {
    return [
      { source: "/api/auth/:path*", destination: `${apiUrl}/api/auth/:path*` },
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/status", destination: `${apiUrl}/status` },
    ];
  },
};

export default nextConfig;
