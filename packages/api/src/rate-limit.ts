import { prisma } from "@repo/database";
import { ApiError } from "./errors";

export interface RateLimitRule {
  /** Maximum accepted calls per window. */
  max: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

/** Limits for API mutations that create records or send email. */
export const API_RATE_LIMITS = {
  invitationCreate: { max: 30, windowSeconds: 60 * 60 },
  organizationCreate: { max: 10, windowSeconds: 60 * 60 },
} as const satisfies Record<string, RateLimitRule>;

/**
 * Atomically counts one call against a fixed window stored in PostgreSQL, so
 * the limit holds across API instances. A window starts at the first call
 * after the previous window expired.
 */
export const consumeRateLimit = async (
  key: string,
  rule: RateLimitRule,
  now: Date = new Date()
): Promise<RateLimitResult> => {
  const windowMs = rule.windowSeconds * 1000;
  const expiredBefore = new Date(now.getTime() - windowMs);
  const [row] = await prisma.$queryRaw<
    { count: number; windowStartedAt: Date }[]
  >`
    INSERT INTO "api_rate_limit" ("key", "count", "windowStartedAt")
    VALUES (${key}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE
        WHEN "api_rate_limit"."windowStartedAt" <= ${expiredBefore} THEN 1
        ELSE "api_rate_limit"."count" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "api_rate_limit"."windowStartedAt" <= ${expiredBefore} THEN ${now}
        ELSE "api_rate_limit"."windowStartedAt"
      END
    RETURNING "count", "windowStartedAt"
  `;

  if (!row) {
    throw new Error(`Rate limit counter for ${key} was not returned.`);
  }

  const windowEndsAt = new Date(row.windowStartedAt).getTime() + windowMs;
  return {
    allowed: Number(row.count) <= rule.max,
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((windowEndsAt - now.getTime()) / 1000)
    ),
  };
};

export const requireRateLimit = async (key: string, rule: RateLimitRule) => {
  const result = await consumeRateLimit(key, rule);
  if (!result.allowed) {
    throw new ApiError(
      "RATE_LIMITED",
      "Too many requests. Try again later.",
      429,
      { retryAfterSeconds: result.retryAfterSeconds }
    );
  }
};
