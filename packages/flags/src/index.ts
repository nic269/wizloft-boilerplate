export type FeatureFlagProvider = {
	isEnabled(key: string, context?: Record<string, unknown>): Promise<boolean>;
};

export const staticFlags = (flags: Record<string, boolean>): FeatureFlagProvider => ({
	async isEnabled(key) {
		return Boolean(flags[key]);
	},
});
