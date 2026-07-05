export type AnalyticsProvider = {
	track(event: string, properties?: Record<string, unknown>): void | Promise<void>;
	identify?(userId: string, traits?: Record<string, unknown>): void | Promise<void>;
};

export const noopAnalytics: AnalyticsProvider = {
	track() {},
	identify() {},
};
