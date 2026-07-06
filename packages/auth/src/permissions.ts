import { prisma } from "@repo/database";

export interface PermissionInput {
  action: string;
  module: string;
  organizationId: string;
  userId: string;
}

export const hasPermission = async (input: PermissionInput): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: { isSuperAdmin: true },
  });

  if (user?.isSuperAdmin) {
    return true;
  }

  const membership = await prisma.membership.findUnique({
    where: {
      userId_organizationId: {
        userId: input.userId,
        organizationId: input.organizationId,
      },
    },
    select: {
      status: true,
      role: {
        select: {
          permissions: {
            where: {
              module: input.module,
              action: input.action,
            },
            select: { id: true },
          },
        },
      },
    },
  });

  return membership?.status === "ACTIVE" && Boolean(membership.role?.permissions.length);
};

export const requirePermission = async (input: PermissionInput) => {
  const allowed = await hasPermission(input);
  if (!allowed) {
    throw new Error(`Missing permission ${input.module}:${input.action}`);
  }
};
