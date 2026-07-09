import { prisma } from "@repo/database";
import { getJobProviderStatus } from "@repo/jobs";
import { getMailProviderStatus } from "@repo/mail";
import { getStorageProviderStatus } from "@repo/storage";

export const getStatusPayload = () =>
  ({ ok: true, service: "api", time: new Date().toISOString() }) as const;

export const getHealthPayload = () => ({ ok: true }) as const;

const checkDatabase = async () => {
  const startedAt = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      healthy: true,
      latencyMs: Math.round(performance.now() - startedAt),
    } as const;
  } catch {
    return {
      healthy: false,
      latencyMs: Math.round(performance.now() - startedAt),
      message: "Database connectivity check failed.",
    } as const;
  }
};

export const getReadyPayload = async () => {
  const database = await checkDatabase();

  return {
    checks: { database },
    ok: database.healthy,
    providers: {
      jobs: getJobProviderStatus(),
      mail: getMailProviderStatus(),
      storage: getStorageProviderStatus(),
    },
  } as const;
};
