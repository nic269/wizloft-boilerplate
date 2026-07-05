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
		role: { findMany: vi.fn(), create: vi.fn() },
		membership: { findMany: vi.fn() },
		auditLog: { findMany: vi.fn() },
		$transaction: vi.fn(),
	},
}));

describe("access control service", () => {
	beforeEach(() => vi.clearAllMocks());

	it("accepts only catalog permissions", () => {
		expect(isKnownPermission({ module: "roles", action: "manage" })).toBe(true);
		expect(isKnownPermission({ module: "billing", action: "delete" })).toBe(false);
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
			role: {
				create: vi.fn().mockResolvedValue({
					id: "role-1",
					name: "Manager",
					description: null,
					permissions: [{ module: "members", action: "read" }],
					_count: { memberships: 0 },
				}),
			},
			auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
		};
		vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

		await createRole({
			organizationId: "org-1",
			name: "Manager",
			permissions: [
				{ module: "members", action: "read" },
				{ module: "billing", action: "delete" },
			],
			actorId: "owner-1",
		});

		expect(transaction.role.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					permissions: { createMany: { data: [{ module: "members", action: "read" }] } },
				}),
			}),
		);
		expect(transaction.auditLog.create).toHaveBeenCalledWith({
			data: expect.objectContaining({ action: "role.created", actorId: "owner-1" }),
		});
	});

	it("updates a member role only when role and membership share the organization", async () => {
		const transaction = {
			role: { findFirst: vi.fn().mockResolvedValue({ id: "role-2", name: "Manager" }) },
			membership: { updateMany: vi.fn().mockResolvedValue({ count: 1 }) },
			auditLog: { create: vi.fn().mockResolvedValue({ id: "audit-1" }) },
		};
		vi.mocked(prisma.$transaction).mockImplementation(async (callback) => callback(transaction as never));

		await updateMemberRole({
			organizationId: "org-1",
			membershipId: "member-1",
			roleId: "role-2",
			actorId: "owner-1",
		});

		expect(transaction.role.findFirst).toHaveBeenCalledWith({
			where: { id: "role-2", organizationId: "org-1" },
			select: { id: true, name: true },
		});
		expect(transaction.membership.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: "member-1", organizationId: "org-1", status: "ACTIVE" } }),
		);
		expect(transaction.auditLog.create).toHaveBeenCalledWith({
			data: expect.objectContaining({ action: "member.role_updated", targetId: "member-1" }),
		});
	});
});
