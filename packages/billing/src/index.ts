export type BillingSubject = {
	type: "user" | "organization";
	id: string;
};

export type PlanState = {
	planId: string;
	status: "active" | "trialing" | "inactive";
};

export type BillingProvider = {
	getCurrentPlan(input: BillingSubject): Promise<PlanState>;
	createCheckout(input: BillingSubject): Promise<{ url: string }>;
	createPortalSession(input: BillingSubject): Promise<{ url: string }>;
	handleWebhook(input: { payload: unknown; signature?: string }): Promise<{ received: boolean }>;
	reportUsage?(input: BillingSubject & { metric: string; value: number }): Promise<void>;
};

export const mockBillingProvider: BillingProvider = {
	async getCurrentPlan() {
		return { planId: "free", status: "active" };
	},
	async createCheckout() {
		return { url: "/settings/billing" };
	},
	async createPortalSession() {
		return { url: "/settings/billing" };
	},
	async handleWebhook() {
		return { received: true };
	},
};
