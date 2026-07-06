import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@repo/database";
import { MEMBER_PERMISSIONS } from "./access-control";

export type InvitationErrorCode =
  | "INVITATION_NOT_FOUND"
  | "INVITATION_NOT_PENDING"
  | "INVITATION_EXPIRED"
  | "INVITATION_EMAIL_MISMATCH";

export class InvitationError extends Error {
  readonly code: InvitationErrorCode;

  constructor(code: InvitationErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}

export const normalizeInvitationEmail = (email: string) => email.trim().toLowerCase();

export const hashInvitationToken = (token: string) => createHash("sha256").update(token).digest("hex");

export const createInvitationToken = () => randomBytes(32).toString("base64url");

export const listInvitations = (organizationId: string) =>
  prisma.invitation.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      email: true,
      expiresAt: true,
      id: true,
      invitedBy: { select: { name: true } },
      status: true,
    },
    where: { organizationId },
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
      create: {
        description: "Standard organization member access.",
        name: "Member",
        organizationId: input.organizationId,
        permissions: { createMany: { data: [...MEMBER_PERMISSIONS] } },
      },
      select: { id: true },
      update: {},
      where: { organizationId_name: { name: "Member", organizationId: input.organizationId } },
    });

    const pending = await transaction.invitation.findFirst({
      select: { id: true },
      where: { email, organizationId: input.organizationId, status: "PENDING" },
    });

    const data = {
      expiresAt: input.expiresAt,
      invitedById: input.invitedById,
      roleId: memberRole.id,
      tokenHash: hashInvitationToken(token),
    };
    const created = pending
      ? await transaction.invitation.update({ data, where: { id: pending.id } })
      : await transaction.invitation.create({
          data: { ...data, email, organizationId: input.organizationId },
        });

    await transaction.auditLog.create({
      data: {
        action: "invitation.created",
        actorId: input.invitedById,
        metadata: { email, expiresAt: input.expiresAt.toISOString() },
        organizationId: input.organizationId,
        targetId: created.id,
        targetType: "Invitation",
      },
    });

    return created;
  });

  return { invitation, token };
};

export const revokeInvitation = (input: { organizationId: string; invitationId: string; actorId: string }) =>
  prisma.$transaction(async (transaction) => {
    const result = await transaction.invitation.updateMany({
      data: { revokedAt: new Date(), status: "REVOKED" },
      where: { id: input.invitationId, organizationId: input.organizationId, status: "PENDING" },
    });
    if (result.count === 0) {
      throw new InvitationError("INVITATION_NOT_PENDING", "Pending invitation not found.");
    }

    await transaction.auditLog.create({
      data: {
        action: "invitation.revoked",
        actorId: input.actorId,
        organizationId: input.organizationId,
        targetId: input.invitationId,
        targetType: "Invitation",
      },
    });
  });

export const acceptInvitation = (input: { token: string; userId: string; userEmail: string; now?: Date }) =>
  prisma.$transaction(async (transaction) => {
    const invitation = await transaction.invitation.findUnique({
      select: {
        email: true,
        expiresAt: true,
        id: true,
        organization: { select: { name: true, slug: true } },
        organizationId: true,
        roleId: true,
        status: true,
      },
      where: { tokenHash: hashInvitationToken(input.token) },
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
      data: { acceptedAt: input.now ?? new Date(), status: "ACCEPTED" },
      where: { id: invitation.id, status: "PENDING" },
    });
    if (transition.count === 0) {
      throw new InvitationError("INVITATION_NOT_PENDING", "Invitation is no longer pending.");
    }

    await transaction.membership.upsert({
      create: {
        organizationId: invitation.organizationId,
        roleId: invitation.roleId,
        status: "ACTIVE",
        userId: input.userId,
      },
      update: { roleId: invitation.roleId, status: "ACTIVE" },
      where: {
        userId_organizationId: { organizationId: invitation.organizationId, userId: input.userId },
      },
    });

    await transaction.auditLog.create({
      data: {
        action: "invitation.accepted",
        actorId: input.userId,
        metadata: { email: invitation.email },
        organizationId: invitation.organizationId,
        targetId: invitation.id,
        targetType: "Invitation",
      },
    });

    return { id: invitation.organizationId, ...invitation.organization };
  });
