import { prisma } from "@repo/database";

export const OWNER_PERMISSIONS = [
	{ module: "organization", action: "read" },
	{ module: "organization", action: "update" },
	{ module: "members", action: "read" },
	{ module: "members", action: "invite" },
	{ module: "members", action: "manage" },
] as const;

export const normalizeOrganizationSlug = (value: string) =>
	value
		.trim()
		.toLowerCase()
		.normalize("NFKD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");

export const listOrganizationsForUser = (userId: string) =>
	prisma.organization.findMany({
		where: {
			memberships: {
				some: { userId, status: "ACTIVE" },
			},
		},
		select: {
			id: true,
			name: true,
			slug: true,
			memberships: {
				where: { userId },
				select: { role: { select: { name: true } } },
				take: 1,
			},
		},
		orderBy: { createdAt: "asc" },
	});

export const createOrganizationForUser = async (input: { userId: string; name: string; slug: string }) =>
	prisma.$transaction(async (transaction) => {
		const organization = await transaction.organization.create({
			data: { name: input.name.trim(), slug: normalizeOrganizationSlug(input.slug) },
			select: { id: true, name: true, slug: true },
		});

		const ownerRole = await transaction.role.create({
			data: {
				organizationId: organization.id,
				name: "Owner",
				description: "Full access to organization settings and members.",
				permissions: { createMany: { data: [...OWNER_PERMISSIONS] } },
			},
			select: { id: true, name: true },
		});

		await transaction.membership.create({
			data: {
				userId: input.userId,
				organizationId: organization.id,
				roleId: ownerRole.id,
				status: "ACTIVE",
			},
		});

		await transaction.auditLog.create({
			data: {
				organizationId: organization.id,
				actorId: input.userId,
				action: "organization.created",
				targetType: "Organization",
				targetId: organization.id,
				metadata: { name: organization.name, slug: organization.slug },
			},
		});

		return { ...organization, role: ownerRole.name };
	});

export const isUniqueConstraintError = (error: unknown): boolean =>
	typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
