import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@repo/database";

export const hashInvitationToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createInvitationToken = () => randomBytes(32).toString("base64url");

export const createInvitation = async (input: {
	organizationId: string;
	email: string;
	roleId?: string;
	invitedById?: string;
	expiresAt: Date;
}) => {
	const token = createInvitationToken();
	const invitation = await prisma.invitation.create({
		data: {
			organizationId: input.organizationId,
			email: input.email.toLowerCase(),
			roleId: input.roleId ?? null,
			invitedById: input.invitedById ?? null,
			expiresAt: input.expiresAt,
			tokenHash: hashInvitationToken(token),
		},
	});

	await prisma.auditLog.create({
		data: {
			organizationId: input.organizationId,
			actorId: input.invitedById ?? null,
			action: "invitation.created",
			targetType: "Invitation",
			targetId: invitation.id,
			metadata: { email: input.email },
		},
	});

	return { invitation, token };
};
