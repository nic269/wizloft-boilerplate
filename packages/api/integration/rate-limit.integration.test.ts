import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";
import { afterEach, describe, expect, it } from "vitest";
import { consumeRateLimit } from "../src/rate-limit";

const keys: string[] = [];
const createKey = () => {
  const key = `integration:${randomUUID()}`;
  keys.push(key);
  return key;
};

afterEach(async () => {
  await prisma.apiRateLimit.deleteMany({
    where: { key: { in: keys.splice(0) } },
  });
});

describe("PostgreSQL API rate limit", () => {
  const rule = { max: 2, windowSeconds: 60 };

  it("rejects calls over the limit until the window expires", async () => {
    const key = createKey();
    const start = new Date("2030-01-01T00:00:00.000Z");
    const at = (seconds: number) => new Date(start.getTime() + seconds * 1000);

    await expect(consumeRateLimit(key, rule, at(0))).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 60,
    });
    await expect(consumeRateLimit(key, rule, at(10))).resolves.toMatchObject({
      allowed: true,
    });
    await expect(consumeRateLimit(key, rule, at(20))).resolves.toEqual({
      allowed: false,
      retryAfterSeconds: 40,
    });
    await expect(consumeRateLimit(key, rule, at(60))).resolves.toEqual({
      allowed: true,
      retryAfterSeconds: 60,
    });
  });

  it("counts concurrent calls atomically", async () => {
    const key = createKey();
    const now = new Date("2030-01-01T00:00:00.000Z");

    const results = await Promise.all(
      Array.from({ length: 6 }, () => consumeRateLimit(key, rule, now))
    );

    expect(results.filter((result) => result.allowed)).toHaveLength(2);
    await expect(
      prisma.apiRateLimit.findUnique({
        select: { count: true },
        where: { key },
      })
    ).resolves.toEqual({ count: 6 });
  });
});
