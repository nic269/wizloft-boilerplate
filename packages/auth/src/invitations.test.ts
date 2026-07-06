import { prisma } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  acceptInvitation,
  createInvitation,
  hashInvitationToken,
  revokeInvitation,
} from "./invitations";

vi.mock("@repo/database", () => ({
  prisma: { $transaction: vi.fn(), invitation: { findMany: vi.fn() } },
}));

describe("invitation service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("hashes invitation credentials before persistence", () => {
    expect(hashInvitationToken("secret-token")).toHaveLength(64);
    expect(hashInvitationToken("secret-token")).not.toContain("secret-token");
  });

  it("creates a Member invitation and audit record transactionally", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      invitation: {
        create: vi
          .fn()
          .mockImplementation(({ data }) => ({ id: "invite-1", ...data })),
        findFirst: vi.fn().mockResolvedValue(null),
      },
      role: { upsert: vi.fn().mockResolvedValue({ id: "role-1" }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(transaction as never)
    );

    const result = await createInvitation({
      email: " USER@example.com ",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      invitedById: "owner-1",
      organizationId: "org-1",
    });

    expect(result.token).toHaveLength(43);
    expect(transaction.invitation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        email: "user@example.com",
        organizationId: "org-1",
        roleId: "role-1",
        tokenHash: hashInvitationToken(result.token),
      }),
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "invitation.created",
        targetId: "invite-1",
      }),
    });
  });

  it("rejects acceptance from a different signed-in email", async () => {
    const transaction = {
      invitation: {
        findUnique: vi.fn().mockResolvedValue({
          email: "invited@example.com",
          expiresAt: new Date("2030-01-01T00:00:00.000Z"),
          id: "invite-1",
          organization: { name: "Acme", slug: "acme" },
          organizationId: "org-1",
          roleId: "role-1",
          status: "PENDING",
        }),
        updateMany: vi.fn(),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(transaction as never)
    );

    await expect(
      acceptInvitation({
        now: new Date("2029-01-01T00:00:00.000Z"),
        token: "token",
        userEmail: "other@example.com",
        userId: "user-1",
      })
    ).rejects.toMatchObject({ code: "INVITATION_EMAIL_MISMATCH" });
    expect(transaction.invitation.updateMany).not.toHaveBeenCalled();
  });

  it("activates membership and records acceptance", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      invitation: {
        findUnique: vi.fn().mockResolvedValue({
          email: "invited@example.com",
          expiresAt: new Date("2030-01-01T00:00:00.000Z"),
          id: "invite-1",
          organization: { name: "Acme", slug: "acme" },
          organizationId: "org-1",
          roleId: "role-1",
          status: "PENDING",
        }),
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
      membership: { upsert: vi.fn().mockResolvedValue({ id: "membership-1" }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(transaction as never)
    );

    await expect(
      acceptInvitation({
        now: new Date("2029-01-01T00:00:00.000Z"),
        token: "token",
        userEmail: "INVITED@example.com",
        userId: "user-1",
      })
    ).resolves.toEqual({ id: "org-1", name: "Acme", slug: "acme" });
    expect(transaction.membership.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: { roleId: "role-1", status: "ACTIVE" },
      })
    );
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "invitation.accepted",
        actorId: "user-1",
      }),
    });
  });

  it("revokes only pending invitations and records audit evidence", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      invitation: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) =>
      callback(transaction as never)
    );

    await revokeInvitation({
      actorId: "owner-1",
      invitationId: "invite-1",
      organizationId: "org-1",
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "invitation.revoked",
        actorId: "owner-1",
      }),
    });
  });
});
