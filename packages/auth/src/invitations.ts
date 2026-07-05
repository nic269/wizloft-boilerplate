import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@repo/database";

const MEMBER_PERMISSIONS = [
	{ module: "organization", action: "read" },
	{ module: "members", action: "read" },
] as const;

export type InvitationErrorCode =
	| "INVITATION_NOT_FOUND"
	| "INVITATION_NOT_PENDING"
	| "INVITATION_EXPIRED"
	| "INVITATION_EMAIL_MISMATCH";

export class InvitationError extends Error {
	constructor(
		public readonly code: InvitationErrorCode,
		message: string,
	) {
		super(message);
	}
}

export const normalizeInvitationEmail = (email: string) => email.trim().toLowerCase();

export const hashInvitationToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createInvitationToken = () => randomBytes(32).toString("base64url");

export const listInvitations = (organizationId: string) =>
	prisma.invitation.findMany({
		where: { organizationId },
		select: {
			id: true,
			email: true,
			status: true,
			expiresAt: true,
			createdAt: true,
			invitedBy: { select: { name: true } },
		},
		orderBy: { createdAt: "desc" },
	});

export const createInvitation = async (input: {
	organizationId: string;
	email: string;
	invitedById: string;
	expiresAt: Date;
}) => {
	const token = createInvitationToken();
	const email = normalizeInvitationEmail(input.email);

	const invitation = await prisma.$transaction(async (transaction) => {
		const memberRole = await transaction.role.upsert({
			where: { organizationId_name: { organizationId: input.organizationId, name: "Member" } },
			create: {
				organizationId: input.organizationId,
				name: "Member",
				description: "Standard organization member access.",
				permissions: { createMany: { data: [...MEMBER_PERMISSIONS] } },
			},
			update: {},
			select: { id: true },
		});

		const pending = await transaction.invitation.findFirst({
			where: { organizationId: input.organizationId, email, status: "PENDING" },
			select: { id: true },
		});

		const data = {
			roleId: memberRole.id,
			invitedById: input.invitedById,
			expiresAt: input.expiresAt,
			tokenHash: hashInvitationToken(token),
		};
		const created = pending
			? await transaction.invitation.update({ where: { id: pending.id }, data })
			: await transaction.invitation.create({
					data: { ...data, organizationId: input.organizationId, email },
				});

		await transaction.auditLog.create({
			data: {
				organizationId: input.organizationId,
				actorId: input.invitedById,
				action: "invitation.created",
				targetType: "Invitation",
				targetId: created.id,
				metadata: { email, expiresAt: input.expiresAt.toISOString() },
			},
		});

		return created;
	});

	return { invitation, token };
};

export const revokeInvitation = (input: { organizationId: string; invitationId: string; actorId: string }) =>
	prisma.$transaction(async (transaction) => {
		const result = await transaction.invitation.updateMany({
			where: { id: input.invitationId, organizationId: input.organizationId, status: "PENDING" },
			data: { status: "REVOKED", revokedAt: new Date() },
		});
		if (result.count === 0) {
			throw new InvitationError("INVITATION_NOT_PENDING", "Pending invitation not found.");
		}

		await transaction.auditLog.create({
			data: {
				organizationId: input.organizationId,
				actorId: input.actorId,
				action: "invitation.revoked",
				targetType: "Invitation",
				targetId: input.invitationId,
			},
		});
	});

export const acceptInvitation = (input: { token: string; userId: string; userEmail: string; now?: Date }) =>
	prisma.$transaction(async (transaction) => {
		const invitation = await transaction.invitation.findUnique({
			where: { tokenHash: hashInvitationToken(input.token) },
			select: {
				id: true,
				organizationId: true,
				email: true,
				roleId: true,
				status: true,
				expiresAt: true,
				organization: { select: { name: true, slug: true } },
			},
		});

		if (!invitation) {
			throw new InvitationError("INVITATION_NOT_FOUND", "Invitation not found.");
		}
		if (invitation.status !== "PENDING") {
			throw new InvitationError("INVITATION_NOT_PENDING", "Invitation is no longer pending.");
		}
		if (invitation.expiresAt <= (input.now ?? new Date())) {
			throw new InvitationError("INVITATION_EXPIRED", "Invitation has expired.");
		}
		if (invitation.email !== normalizeInvitationEmail(input.userEmail)) {
			throw new InvitationError("INVITATION_EMAIL_MISMATCH", "Sign in with the email address that was invited.");
		}

		const transition = await transaction.invitation.updateMany({
			where: { id: invitation.id, status: "PENDING" },
			data: { status: "ACCEPTED", acceptedAt: input.now ?? new Date() },
		});
		if (transition.count === 0) {
			throw new InvitationError("INVITATION_NOT_PENDING", "Invitation is no longer pending.");
		}

		await transaction.membership.upsert({
			where: {
				userId_organizationId: { userId: input.userId, organizationId: invitation.organizationId },
			},
			create: {
				userId: input.userId,
				organizationId: invitation.organizationId,
				roleId: invitation.roleId,
				status: "ACTIVE",
			},
			update: { roleId: invitation.roleId, status: "ACTIVE" },
		});

		await transaction.auditLog.create({
			data: {
				organizationId: invitation.organizationId,
				actorId: input.userId,
				action: "invitation.accepted",
				targetType: "Invitation",
				targetId: invitation.id,
				metadata: { email: invitation.email },
			},
		});

		return { id: invitation.organizationId, ...invitation.organization };
	});
