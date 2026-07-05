import { logger } from "@repo/logger";
import type { ReactElement } from "react";
import { keys } from "./keys";

export type SendMailInput = {
	to: string;
	from?: string;
	subject: string;
	react?: ReactElement;
	text?: string;
};

export type MailProvider = {
	send(input: SendMailInput): Promise<{ id: string; provider: string }>;
};

export const consoleMailProvider: MailProvider = {
	async send(input) {
		logger.info("mail.console", { to: input.to, subject: input.subject });
		return { id: crypto.randomUUID(), provider: "console" };
	},
};

export const getMailProvider = (): MailProvider => {
	const env = keys();

	if (!env.RESEND_API_KEY) {
		return consoleMailProvider;
	}

	return {
		async send(input) {
			const { Resend } = await import("resend");
			const resend = new Resend(env.RESEND_API_KEY);
			const emails = resend.emails as unknown as {
				send(input: Record<string, unknown>): Promise<{ data?: { id?: string } }>;
			};
			const payload = {
				from: input.from ?? env.RESEND_FROM_EMAIL ?? "noreply@example.com",
				to: input.to,
				subject: input.subject,
				...(input.react ? { react: input.react } : {}),
				...(input.text ? { text: input.text } : {}),
			};
			const response = await emails.send(payload);

			return { id: response.data?.id ?? crypto.randomUUID(), provider: "resend" };
		},
	};
};

export const sendMail = (input: SendMailInput) => getMailProvider().send(input);
