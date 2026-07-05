import { prisma } from "@repo/database";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createOrganizationForUser, listOrganizationsForUser, normalizeOrganizationSlug } from "./organizations";

vi.mock("@repo/database", () => ({
	prisma: {
		organization: { findMany: vi.fn() },
		$transaction: vi.fn(),
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
				where: { memberships: { some: { userId: "user-1", status: "ACTIVE" } } },
			}),
		);
	});

	it("provisions owner access and audit evidence in one transaction", async () => {
		const transaction = {
			organization: { create: vi.fn().mockResolvedValue({ id: "org-1", name: "Acme", slug: "acme" }) },
			role: { create: vi.fn().mockResolvedValue({ id: "role-1", name: "Owner" }) },
			membership: { create: vi.fn().mockResolvedValue({ id: "membership-1" }) },
			auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
		};
		vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

		await expect(createOrganizationForUser({ userId: "user-1", name: "Acme", slug: "Acme" })).resolves.toEqual({
			id: "org-1",
			name: "Acme",
			slug: "acme",
			role: "Owner",
		});
		expect(transaction.membership.create).toHaveBeenCalledWith({
			data: {
				userId: "user-1",
				organizationId: "org-1",
				roleId: "role-1",
				status: "ACTIVE",
			},
		});
		expect(transaction.auditLog.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				organizationId: "org-1",
				actorId: "user-1",
				action: "organization.created",
			}),
		});
	});
});
