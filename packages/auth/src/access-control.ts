import {
  normalizePermissions,
  type PermissionInput,
} from "@repo/access-control";
import { prisma } from "@repo/database";

const OWNER_ROLE_NAME = "Owner";

const isSystemOwnerRole = (role?: { isSystem: boolean; name: string } | null) =>
  role?.isSystem === true && role.name === OWNER_ROLE_NAME;

export {
  isKnownPermission,
  MEMBER_PERMISSIONS,
  OWNER_PERMISSIONS,
  PERMISSION_CATALOG,
  type PermissionDefinition,
  type PermissionInput,
} from "@repo/access-control";

export const listRoles = (organizationId: string) =>
  prisma.role.findMany({
    orderBy: { name: "asc" },
    select: {
      _count: { select: { memberships: true } },
      description: true,
      id: true,
      name: true,
      permissions: {
        orderBy: [{ module: "asc" }, { action: "asc" }],
        select: { action: true, module: true },
      },
    },
    where: { organizationId },
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
        description: input.description?.trim() || null,
        name: input.name.trim(),
        organizationId: input.organizationId,
        permissions: { createMany: { data: permissions } },
      },
      select: {
        _count: { select: { memberships: true } },
        description: true,
        id: true,
        name: true,
        permissions: {
          orderBy: [{ module: "asc" }, { action: "asc" }],
          select: { action: true, module: true },
        },
      },
    });

    const permissionMetadata = permissions.map(({ module, action }) => ({
      action,
      module,
    }));

    await transaction.auditLog.create({
      data: {
        action: "role.created",
        actorId: input.actorId,
        metadata: { name: role.name, permissions: permissionMetadata },
        organizationId: input.organizationId,
        targetId: role.id,
        targetType: "Role",
      },
    });

    return role;
  });

export const listMembers = (organizationId: string) =>
  prisma.membership.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      id: true,
      role: { select: { id: true, name: true } },
      status: true,
      user: { select: { email: true, id: true, name: true } },
    },
    where: { organizationId, status: "ACTIVE" },
  });

export const updateMemberRole = (input: {
  organizationId: string;
  membershipId: string;
  roleId: string;
  actorId: string;
}) =>
  prisma.$transaction(async (transaction) => {
    const role = await transaction.role.findFirst({
      select: { id: true, isSystem: true, name: true },
      where: { id: input.roleId, organizationId: input.organizationId },
    });
    if (!role) {
      throw new Error("ROLE_NOT_FOUND");
    }

    const membership = await transaction.membership.findFirst({
      select: { id: true, role: { select: { isSystem: true, name: true } } },
      where: {
        id: input.membershipId,
        organizationId: input.organizationId,
        status: "ACTIVE",
      },
    });
    if (!membership) {
      throw new Error("MEMBERSHIP_NOT_FOUND");
    }

    if (isSystemOwnerRole(membership.role) && !isSystemOwnerRole(role)) {
      const remainingOwnerCount = await transaction.membership.count({
        where: {
          id: { not: input.membershipId },
          organizationId: input.organizationId,
          role: { isSystem: true, name: OWNER_ROLE_NAME },
          status: "ACTIVE",
        },
      });
      if (remainingOwnerCount === 0) {
        throw new Error("LAST_OWNER_REQUIRED");
      }
    }

    const result = await transaction.membership.updateMany({
      data: { roleId: role.id },
      where: {
        id: input.membershipId,
        organizationId: input.organizationId,
        status: "ACTIVE",
      },
    });
    if (result.count === 0) {
      throw new Error("MEMBERSHIP_NOT_FOUND");
    }

    await transaction.auditLog.create({
      data: {
        action: "member.role_updated",
        actorId: input.actorId,
        metadata: { roleId: role.id, roleName: role.name },
        organizationId: input.organizationId,
        targetId: input.membershipId,
        targetType: "Membership",
      },
    });
  });

export const listAuditLogs = (organizationId: string) =>
  prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      action: true,
      actor: { select: { email: true, name: true } },
      createdAt: true,
      id: true,
      metadata: true,
      targetId: true,
      targetType: true,
    },
    take: 50,
    where: { organizationId },
  });
