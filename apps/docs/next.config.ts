import type { NextConfig } from "next";
import "./env";

export default {
	output: "standalone",
	transpilePackages: ["@repo/design-system", "@t3-oss/env-core", "@t3-oss/env-nextjs"],
} satisfies NextConfig;
