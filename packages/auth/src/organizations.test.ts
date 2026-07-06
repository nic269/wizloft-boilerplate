import { prisma } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrganizationForUser, listOrganizationsForUser, normalizeOrganizationSlug } from "./organizations";

vi.mock("@repo/database", () => ({
  prisma: {
    $transaction: vi.fn(),
    organization: { findMany: vi.fn() },
  },
}));

describe("organization service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("normalizes user-facing names into stable slugs", () => {
    expect(normalizeOrganizationSlug("  Anh Nguyễn & Co.  ")).toBe("anh-nguyen-co");
  });

  it("scopes organization queries to active memberships", async () => {
    vi.mocked(prisma.organization.findMany).mockResolvedValue([]);
    await listOrganizationsForUser("user-1");

    expect(prisma.organization.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { memberships: { some: { status: "ACTIVE", userId: "user-1" } } },
      }),
    );
  });

  it("provisions owner access and audit evidence in one transaction", async () => {
    const transaction = {
      auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
      membership: { create: vi.fn().mockResolvedValue({ id: "membership-1" }) },
      organization: { create: vi.fn().mockResolvedValue({ id: "org-1", name: "Acme", slug: "acme" }) },
      role: { create: vi.fn().mockResolvedValue({ id: "role-1", name: "Owner" }) },
    };
    vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

    await expect(createOrganizationForUser({ name: "Acme", slug: "Acme", userId: "user-1" })).resolves.toEqual({
      id: "org-1",
      name: "Acme",
      role: "Owner",
      slug: "acme",
    });
    expect(transaction.membership.create).toHaveBeenCalledWith({
      data: {
        organizationId: "org-1",
        roleId: "role-1",
        status: "ACTIVE",
        userId: "user-1",
      },
    });
    expect(transaction.auditLog.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: "organization.created",
        actorId: "user-1",
        organizationId: "org-1",
      }),
    });
  });
});
