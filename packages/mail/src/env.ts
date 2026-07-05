import { z } from "@repo/env";

export const mailEnv = {
	optionalServer: {
		RESEND_API_KEY: z.string().min(1).optional(),
		RESEND_FROM_EMAIL: z.string().email().optional(),
		SMTP_URL: z.string().url().optional(),
	},
};
