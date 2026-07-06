import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@repo/config", "@repo/design-system", "@t3-oss/env-core", "@t3-oss/env-nextjs"],
};

export default nextConfig;
