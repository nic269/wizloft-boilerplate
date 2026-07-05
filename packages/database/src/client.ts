import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
	process.env.DATABASE_URL ??= "postgresql://postgres:postgres@localhost:5432/personal_saas_boilerplate";
}

const globalForPrisma = globalThis as unknown as {
	prisma?: PrismaClient;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
	});

if (process.env.NODE_ENV !== "production") {
	globalForPrisma.prisma = prisma;
}

export { Prisma, PrismaClient } from "@prisma/client";
