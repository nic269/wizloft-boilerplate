export const getStatusPayload = () => ({ ok: true, service: "api", time: new Date().toISOString() }) as const;

export const getHealthPayload = () => ({ ok: true }) as const;

export const getReadyPayload = () => ({ ok: true }) as const;
