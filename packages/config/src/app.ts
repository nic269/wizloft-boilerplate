export const appConfig = {
  afterLoginPath: "/dashboard",
  afterLogoutPath: "/sign-in",
  dashboardPath: "/dashboard",
  defaultLocale: "en",
  description:
    "A modern, generic SaaS foundation for Anh Nguyen's future apps.",
  name: "Personal SaaS Boilerplate",
  supportEmail: "support@example.com",
} as const;

export const appSurfaces: readonly string[] = [
  "apps/app",
  "apps/web",
  "apps/api",
  "apps/docs",
  "apps/email",
  "apps/storybook",
];
