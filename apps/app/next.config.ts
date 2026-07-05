import type { NextConfig } from "next";

const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

const nextConfig: NextConfig = {
	transpilePackages: ["@repo/api", "@repo/auth", "@repo/config", "@repo/design-system"],
	async rewrites() {
		return [
			{ source: "/api/auth/:path*", destination: `${apiUrl}/api/auth/:path*` },
			{ source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
			{ source: "/status", destination: `${apiUrl}/status` },
		];
	},
};

export default nextConfig;
