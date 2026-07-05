import { prisma } from "./client";

const defaultPermissions = [
	"members:read",
	"members:invite",
	"members:update",
	"settings:read",
	"settings:update",
	"audit:read",
] as const;

const main = async () => {
	const organization = await prisma.organization.upsert({
		where: { slug: "default" },
		create: { name: "Default Organization", slug: "default" },
		update: {},
	});

	for (const name of ["Owner", "Admin", "Member", "Viewer"]) {
		await prisma.role.upsert({
			where: { organizationId_name: { organizationId: organization.id, name } },
			create: {
				name,
				organizationId: organization.id,
				permissions: {
					create: defaultPermissions
						.filter((permission) => name !== "Viewer" || permission.endsWith(":read"))
						.map((permission) => {
							const [module, action] = permission.split(":") as [string, string];
							return { module, action };
						}),
				},
			},
			update: {},
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
