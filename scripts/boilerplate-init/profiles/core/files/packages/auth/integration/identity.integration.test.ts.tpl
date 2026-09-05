import { randomUUID } from "node:crypto";
import { prisma } from "@repo/database";
import { afterAll, describe, expect, it } from "vitest";

describe("identity persistence", () => {
  const createdUserIds: string[] = [];

  afterAll(async () => {
    await prisma.session.deleteMany({ where: { userId: { in: createdUserIds } } });
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds } } });
    await prisma.$disconnect();
  });

  it("persists a user and an authenticated session", async () => {
    const userId = randomUUID();
    createdUserIds.push(userId);
    const expiresAt = new Date(Date.now() + 60_000);

    await prisma.user.create({
      data: {
        email: `${userId}@example.test`,
        emailVerified: true,
        id: userId,
        name: "Core identity user",
        sessions: {
          create: {
            expiresAt,
            id: randomUUID(),
            token: randomUUID(),
          },
        },
      },
    });

    const stored = await prisma.user.findUnique({
      include: { sessions: true },
      where: { id: userId },
    });

    expect(stored).toMatchObject({
      emailVerified: true,
      id: userId,
      sessions: [{ expiresAt, userId }],
    });
  });
});
