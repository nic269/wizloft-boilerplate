import path from "node:path";
import type { NextConfig } from "next";
import "./env";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.join(import.meta.dirname, "../.."),
  transpilePackages: [
    "@repo/config",
    "@repo/design-system",
    "@t3-oss/env-core",
    "@t3-oss/env-nextjs",
  ],
};

export default nextConfig;
