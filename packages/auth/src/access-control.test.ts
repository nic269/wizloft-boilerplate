import { prisma } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRole,
  isKnownPermission,
  listAuditLogs,
  listMembers,
  listRoles,
  updateMemberRole,
} from "./access-control";

vi.mock("@repo/database", () => ({
  prisma: {
    $transaction: vi.fn(),
    auditLog: { findMany: vi.fn() },
    membership: { findMany: vi.fn() },
    role: { create: vi.fn(), findMany: vi.fn() },
  },
}));

describe("access control service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("accepts only catalog permissions", () => {
    expect(isKnownPermission({ action: "manage", module: "roles" })).toBe(true);
    expect(isKnownPermission({ action: "delete", module: "billing" })).toBe(false);
  });

  it("scopes role, member, and audit queries to one organization", async () => {
    vi.mocked(prisma.role.findMany).mockResolvedValue([]);
    vi.mocked(prisma.membership.findMany).mockResolvedValue([]);
    vi.mocked(prisma.auditLog.findMany).mockResolvedValue([]);

    await listRoles("org-1");
    await listMembers("org-1");
    await listAuditLogs("org-1");

    expect(prisma.role.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { organizationId: "org-1" } }));
    expect(prisma.membership.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org-1", status: "ACTIVE" } }),
    );
    expect(prisma.auditLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { organizationId: "org-1" } }),
    );
  });

  it("creates roles with catalog permissions and audit evidence transactionally", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      role: {
        create: vi.fn().mockResolvedValue({
          _count: { memberships: 0 },
          description: null,
          id: "role-1",
          name: "Manager",
          permissions: [{ action: "read", module: "members" }],
        }),
      },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

    await createRole({
      actorId: "owner-1",
      name: "Manager",
      organizationId: "org-1",
      permissions: [
        { action: "read", module: "members" },
        { action: "delete", module: "billing" },
      ],
    });

    expect(transaction.role.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          permissions: { createMany: { data: [{ action: "read", module: "members" }] } },
        }),
      }),
    );
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "role.created", actorId: "owner-1" }),
    });
  });

  it("updates a member role only when role and membership share the organization", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      membership: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
      role: { findFirst: vi.fn().mockResolvedValue({ id: "role-2", name: "Manager" }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

    await updateMemberRole({
      actorId: "owner-1",
      membershipId: "member-1",
      organizationId: "org-1",
      roleId: "role-2",
    });

    expect(transaction.role.findFirst).toHaveBeenCalledWith({
      select: { id: true, name: true },
      where: { id: "role-2", organizationId: "org-1" },
    });
    expect(transaction.membership.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "member-1", organizationId: "org-1", status: "ACTIVE" } }),
    );
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ action: "member.role_updated", targetId: "member-1" }),
    });
  });
});
