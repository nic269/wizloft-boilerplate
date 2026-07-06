export interface BillingSubject {
  id: string;
  type: "user" | "organization";
}

export interface PlanState {
  planId: string;
  status: "active" | "trialing" | "inactive";
}

export interface BillingProvider {
  createCheckout(input: BillingSubject): Promise<{ url: string }>;
  createPortalSession(input: BillingSubject): Promise<{ url: string }>;
  getCurrentPlan(input: BillingSubject): Promise<PlanState>;
  handleWebhook(input: { payload: unknown; signature?: string }): Promise<{ received: boolean }>;
  reportUsage?(input: BillingSubject & { metric: string; value: number }): Promise<void>;
}

export const mockBillingProvider: BillingProvider = {
  getCurrentPlan() {
    return Promise.resolve({ planId: "free", status: "active" });
  },
  createCheckout() {
    return Promise.resolve({ url: "/settings/billing" });
  },
  createPortalSession() {
    return Promise.resolve({ url: "/settings/billing" });
  },
  handleWebhook() {
    return Promise.resolve({ received: true });
  },
};
