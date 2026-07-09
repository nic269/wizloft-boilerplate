import { ApiError } from "../errors";
import { getHealthPayload, getReadyPayload, getStatusPayload } from "../health";
import { os } from "./implementer";

const health = os.health.health.handler(() => getHealthPayload());
const requireReadyPayload = async () => {
  const payload = await getReadyPayload();
  if (!payload.ok) {
    throw new ApiError(
      "SERVICE_UNAVAILABLE",
      "API is not ready to accept traffic.",
      503,
      { checks: payload.checks }
    );
  }
  return { ...payload, ok: true as const };
};

const ready = os.health.ready.handler(() => requireReadyPayload());
const status = os.health.status.handler(() => getStatusPayload());

export const healthRouter = {
  health,
  legacyRpc: {
    health: os.health.legacyRpc.health.handler(() => ({
      data: getHealthPayload(),
    })),
    ready: os.health.legacyRpc.ready.handler(async () => ({
      data: await requireReadyPayload(),
    })),
    status: os.health.legacyRpc.status.handler(() => ({
      data: getStatusPayload(),
    })),
  },
  ready,
  status,
};
