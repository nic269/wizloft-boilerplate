import { logger } from "@repo/logger";
import type { ReactElement } from "react";
import { keys } from "./keys";

export interface SendMailInput {
  from?: string;
  react?: ReactElement;
  subject: string;
  text?: string;
  to: string;
}

export interface MailProvider {
  send(input: SendMailInput): Promise<{ id: string; provider: string }>;
}

export interface MailProviderStatus {
  configured: boolean;
  mode: "development" | "provider";
  provider: "console" | "resend";
}

export const consoleMailProvider: MailProvider = {
  send(input) {
    logger.info("mail.console", { to: input.to, subject: input.subject });
    return Promise.resolve({ id: crypto.randomUUID(), provider: "console" });
  },
};

export const getMailProviderStatus = (): MailProviderStatus => {
  const env = keys();

  if (!env.RESEND_API_KEY) {
    return { provider: "console", configured: true, mode: "development" };
  }

  return { provider: "resend", configured: Boolean(env.RESEND_FROM_EMAIL), mode: "provider" };
};

export const getMailProvider = (): MailProvider => {
  const env = keys();
  const status = getMailProviderStatus();

  if (status.provider === "console") {
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
