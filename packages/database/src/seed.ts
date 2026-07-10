import { pathToFileURL } from "node:url";
import { ROLE_PERMISSION_PRESETS } from "@repo/access-control";
import { prisma } from "./client";

const SYSTEM_ROLE_DESCRIPTIONS = {
  Admin: "Administrative access to organization resources.",
  Member: "Standard organization member access.",
  Owner: "Full access to organization settings and members.",
  Viewer: "Read-only access to organization resources.",
} as const;

export const seedDatabase = async (client = prisma) =>
  client.$transaction(async (transaction) => {
    const organization = await transaction.organization.upsert({
      create: { name: "Default Organization", slug: "default" },
      update: {},
      where: { slug: "default" },
    });

    const roleNames = Object.keys(ROLE_PERMISSION_PRESETS) as Array<
      keyof typeof ROLE_PERMISSION_PRESETS
    >;
    for (const name of roleNames) {
      const permissions = ROLE_PERMISSION_PRESETS[name];
      const role = await transaction.role.upsert({
        create: {
          description: SYSTEM_ROLE_DESCRIPTIONS[name],
          isSystem: true,
          name,
          organizationId: organization.id,
        },
        update: {
          description: SYSTEM_ROLE_DESCRIPTIONS[name],
          isSystem: true,
        },
        where: {
          organizationId_name: { name, organizationId: organization.id },
        },
      });

      await transaction.rolePermission.deleteMany({
        where: { roleId: role.id },
      });
      await transaction.rolePermission.createMany({
        data: permissions.map((permission) => ({
          ...permission,
          roleId: role.id,
        })),
      });
    }
  });

const isDirectExecution =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectExecution) {
  seedDatabase()
    .then(() => prisma.$disconnect())
    .catch(async (error: unknown) => {
      console.error(error);
      await prisma.$disconnect();
      process.exit(1);
    });
}
