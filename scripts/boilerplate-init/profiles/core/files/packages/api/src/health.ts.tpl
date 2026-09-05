import { authMailRequired } from "@repo/config";
import { prisma } from "@repo/database";
import {
  assertMailProviderConfiguration,
  getMailProviderStatus,
} from "@repo/mail";

export const getStatusPayload = () =>
  ({ ok: true, service: "api", time: new Date().toISOString() }) as const;

export const getHealthPayload = () => ({ ok: true }) as const;

const withRequirement = <TStatus extends {
  configured: boolean;
  state: "configured" | "disabled" | "misconfigured";
}>(status: TStatus, required: boolean) => ({
  ...status,
  healthy:
    status.state === "configured" || (status.state === "disabled" && !required),
  required,
});

export const getApiProviderReadiness = () => ({
  mail: withRequirement(
    getMailProviderStatus(),
    process.env.NODE_ENV === "production" && authMailRequired
  ),
});

export const assertApiProviderConfiguration = () => {
  assertMailProviderConfiguration({ required: authMailRequired });
  const unhealthy = Object.entries(getApiProviderReadiness())
    .filter(([, provider]) => !provider.healthy)
    .map(([name]) => name);
  if (process.env.NODE_ENV === "production" && unhealthy.length > 0) {
    throw new Error(`Required providers are not ready: ${unhealthy.join(", ")}.`);
  }
};

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
  const providers = getApiProviderReadiness();
  const providersHealthy = Object.values(providers).every(
    (provider) => provider.healthy
  );
  return {
    checks: { database },
    ok: database.healthy && providersHealthy,
    providers,
  } as const;
};
