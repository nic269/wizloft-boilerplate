import { securityHeaderRoutes } from "@repo/config/security-headers";
import type { NextConfig } from "next";
import "./env";

export default {
  headers: async () => securityHeaderRoutes(),
  output: "standalone",
  transpilePackages: [
    "@repo/design-system",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
  ],
} satisfies NextConfig;
