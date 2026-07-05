import { prisma } from "@repo/database";

export const PERMISSION_CATALOG = [
	{ module: "organization", action: "read", label: "Read organization" },
	{ module: "organization", action: "update", label: "Update organization" },
	{ module: "members", action: "read", label: "Read members" },
	{ module: "members", action: "invite", label: "Invite members" },
	{ module: "members", action: "manage", label: "Manage members" },
	{ module: "roles", action: "read", label: "Read roles" },
	{ module: "roles", action: "manage", label: "Manage roles" },
	{ module: "audit", action: "read", label: "Read audit log" },
] as const;

export type PermissionDefinition = (typeof PERMISSION_CATALOG)[number];
export type PermissionInput = { module: string; action: string };

export const OWNER_PERMISSIONS = PERMISSION_CATALOG.map(({ module, action }) => ({ module, action }));

export const MEMBER_PERMISSIONS = [
	{ module: "organization", action: "read" },
	{ module: "members", action: "read" },
	{ module: "roles", action: "read" },
] as const;

export const isKnownPermission = (permission: PermissionInput) =>
	PERMISSION_CATALOG.some(
		(candidate) => candidate.module === permission.module && candidate.action === permission.action,
	);

const normalizePermissions = (permissions: PermissionInput[]) => {
	const unique = new Map<string, PermissionInput>();
	for (const permission of permissions) {
		if (isKnownPermission(permission)) {
			unique.set(`${permission.module}:${permission.action}`, permission);
		}
	}
	return [...unique.values()];
};

export const listRoles = (organizationId: string) =>
	prisma.role.findMany({
		where: { organizationId },
		select: {
			id: true,
			name: true,
			description: true,
			permissions: { select: { module: true, action: true }, orderBy: [{ module: "asc" }, { action: "asc" }] },
			_count: { select: { memberships: true } },
		},
		orderBy: { name: "asc" },
	});

export const createRole = (input: {
	organizationId: string;
	name: string;
	description?: string;
	permissions: PermissionInput[];
	actorId: string;
}) =>
	prisma.$transaction(async (transaction) => {
		const permissions = normalizePermissions(input.permissions);
		const role = await transaction.role.create({
			data: {
				organizationId: input.organizationId,
				name: input.name.trim(),
				description: input.description?.trim() || null,
				permissions: { createMany: { data: permissions } },
			},
			select: {
				id: true,
				name: true,
				description: true,
				permissions: { select: { module: true, action: true }, orderBy: [{ module: "asc" }, { action: "asc" }] },
				_count: { select: { memberships: true } },
			},
		});

		await transaction.auditLog.create({
			data: {
				organizationId: input.organizationId,
				actorId: input.actorId,
				action: "role.created",
				targetType: "Role",
				targetId: role.id,
				metadata: { name: role.name, permissions },
			},
		});

		return role;
	});

export const listMembers = (organizationId: string) =>
	prisma.membership.findMany({
		where: { organizationId, status: "ACTIVE" },
		select: {
			id: true,
			status: true,
			createdAt: true,
			user: { select: { id: true, name: true, email: true } },
			role: { select: { id: true, name: true } },
		},
		orderBy: { createdAt: "asc" },
	});

export const updateMemberRole = (input: {
	organizationId: string;
	membershipId: string;
	roleId: string;
	actorId: string;
}) =>
	prisma.$transaction(async (transaction) => {
		const role = await transaction.role.findFirst({
			where: { id: input.roleId, organizationId: input.organizationId },
			select: { id: true, name: true },
		});
		if (!role) {
			throw new Error("ROLE_NOT_FOUND");
		}

		const result = await transaction.membership.updateMany({
			where: { id: input.membershipId, organizationId: input.organizationId, status: "ACTIVE" },
			data: { roleId: role.id },
		});
		if (result.count === 0) {
			throw new Error("MEMBERSHIP_NOT_FOUND");
		}

		await transaction.auditLog.create({
			data: {
				organizationId: input.organizationId,
				actorId: input.actorId,
				action: "member.role_updated",
				targetType: "Membership",
				targetId: input.membershipId,
				metadata: { roleId: role.id, roleName: role.name },
			},
		});
	});

export const listAuditLogs = (organizationId: string) =>
	prisma.auditLog.findMany({
		where: { organizationId },
		select: {
			id: true,
			action: true,
			targetType: true,
			targetId: true,
			metadata: true,
			createdAt: true,
			actor: { select: { name: true, email: true } },
		},
		orderBy: { createdAt: "desc" },
		take: 50,
	});
