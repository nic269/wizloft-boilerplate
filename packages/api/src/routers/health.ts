import { getHealthPayload, getReadyPayload, getStatusPayload } from "../health";
import { os } from "./implementer";

const health = os.health.health.handler(() => getHealthPayload());
const ready = os.health.ready.handler(() => getReadyPayload());
const status = os.health.status.handler(() => getStatusPayload());

export const healthRouter = {
  health,
  legacyRpc: {
    health: os.health.legacyRpc.health.handler(() => ({
      data: getHealthPayload(),
    })),
    ready: os.health.legacyRpc.ready.handler(() => ({
      data: getReadyPayload(),
    })),
    status: os.health.legacyRpc.status.handler(() => ({
      data: getStatusPayload(),
    })),
  },
  ready,
  status,
};
