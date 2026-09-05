import { pathToFileURL } from "node:url";
import { prisma } from "./client";

export const seedDatabase = () => {
  console.log("Core profile has no baseline data to seed.");
  return Promise.resolve();
};

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
