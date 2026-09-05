export interface AuthFeatureConfig {
  passwordReset: boolean;
  requireEmailVerification: boolean;
}

export const authFeatureConfig = {
  passwordReset: true,
  requireEmailVerification: true,
} as const satisfies AuthFeatureConfig;

export const isAuthMailRequired = (features: AuthFeatureConfig) =>
  Object.values(features).some(Boolean);

export const authMailRequired = isAuthMailRequired(authFeatureConfig);

export const featureConfig = {} as const;
