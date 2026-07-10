import { prisma } from "@repo/database";
import { PasswordResetEmail, sendMail, VerificationEmail } from "@repo/mail";
import type { BetterAuthOptions, User } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createElement } from "react";
import { keys } from "./keys";

const APP_NAME = "Personal SaaS Boilerplate";
const PASSWORD_RESET_SUBJECT = `Reset your ${APP_NAME} password`;
const EMAIL_VERIFICATION_SUBJECT = `Verify your ${APP_NAME} email`;

type AuthEnv = ReturnType<typeof keys>;

interface AuthEmailInput {
  url: string;
  user: User;
}

export const sendPasswordResetEmail = ({ user, url }: AuthEmailInput) =>
  sendMail({
    react: createElement(PasswordResetEmail, {
      appName: APP_NAME,
      resetUrl: url,
    }),
    subject: PASSWORD_RESET_SUBJECT,
    text: `Use this link to reset your ${APP_NAME} password: ${url}`,
    to: user.email,
  });

export const sendEmailVerificationEmail = ({ user, url }: AuthEmailInput) =>
  sendMail({
    react: createElement(VerificationEmail, {
      appName: APP_NAME,
      verifyUrl: url,
    }),
    subject: EMAIL_VERIFICATION_SUBJECT,
    text: `Use this link to verify your ${APP_NAME} email: ${url}`,
    to: user.email,
  });

export const createAuthOptions = (env: AuthEnv = keys()): BetterAuthOptions => {
  const googleEnabled = Boolean(
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
  );

  return {
    advanced: {
      database: {
        generateId: false,
      },
    },
    basePath: "/api/auth",
    baseURL: env.BETTER_AUTH_URL,
    database: prismaAdapter(prisma, { provider: "postgresql" }),
    emailAndPassword: {
      autoSignIn: true,
      enabled: true,
      maxPasswordLength: 128,
      minPasswordLength: 8,
      resetPasswordTokenExpiresIn: 60 * 60,
      sendResetPassword: async (data) => {
        await sendPasswordResetEmail(data);
      },
    },
    emailVerification: {
      expiresIn: 60 * 60,
      sendOnSignUp: true,
      sendVerificationEmail: async (data) => {
        await sendEmailVerificationEmail(data);
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    socialProviders: googleEnabled
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID as string,
            clientSecret: env.GOOGLE_CLIENT_SECRET as string,
          },
        }
      : undefined,
    trustedOrigins: [env.NEXT_PUBLIC_APP_URL, env.NEXT_PUBLIC_WEB_URL],
  };
};
