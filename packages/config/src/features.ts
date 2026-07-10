export const authFeatureConfig = {
  organizationInvitations: true,
  passwordReset: true,
  requireEmailVerification: true,
} as const;

export const authMailRequired = Object.values(authFeatureConfig).some(Boolean);

export const featureConfig = {
  analytics: false,
  billing: false,
  cms: false,
  docs: true,
  email: true,
  i18n: false,
  jobs: true,
  organizations: true,
  storage: true,
} as const;
