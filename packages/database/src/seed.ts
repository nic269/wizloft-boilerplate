import { ROLE_PERMISSION_PRESETS } from "@repo/access-control";
import { prisma } from "./client";

const main = async () => {
  const organization = await prisma.organization.upsert({
    create: { name: "Default Organization", slug: "default" },
    update: {},
    where: { slug: "default" },
  });

  for (const [name, permissions] of Object.entries(ROLE_PERMISSION_PRESETS)) {
    await prisma.role.upsert({
      create: {
        name,
        organizationId: organization.id,
        permissions: {
          create: [...permissions],
        },
      },
      update: {},
      where: { organizationId_name: { name, organizationId: organization.id } },
    });
  }
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
