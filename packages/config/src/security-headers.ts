export interface HttpHeader {
  key: string;
  value: string;
}

/**
 * Baseline response headers for every Next.js surface. A Content-Security-Policy
 * is intentionally left to each product because it depends on the scripts,
 * analytics, and embeds that product loads.
 */
export const securityHeaders: readonly HttpHeader[] = [
  { key: "Strict-Transport-Security", value: "max-age=63072000" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), geolocation=(), microphone=(), payment=()",
  },
];

/** Next.js `headers()` entries applying `securityHeaders` to all routes. */
export const securityHeaderRoutes = () => [
  { headers: [...securityHeaders], source: "/:path*" },
];
