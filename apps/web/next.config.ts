import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/config", "@repo/design-system"],
};

export default nextConfig;
