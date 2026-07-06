export * from "./keys";
export * from "./provider";
export * from "./providers/local";
export * from "./providers/memory";
export * from "./providers/s3";

import { keys } from "./keys";
import { createLocalStorageProvider } from "./providers/local";
import { createMemoryStorageProvider } from "./providers/memory";
import { createS3StorageProvider, isS3StorageConfigured } from "./providers/s3";

export interface StorageProviderStatus {
  configured: boolean;
  mode: "durable" | "ephemeral" | "disabled";
  provider: "local" | "memory" | "s3" | "r2";
}

export const getStorageProviderStatus = (): StorageProviderStatus => {
  const env = keys();
  const provider = env.STORAGE_PROVIDER ?? "local";

  if (provider === "memory") {
    return { provider, configured: true, mode: "ephemeral" };
  }

  if (provider === "s3" || provider === "r2") {
    const configured = isS3StorageConfigured({
      bucket: env.S3_BUCKET,
      region: env.S3_REGION,
      accessKeyId: env.S3_ACCESS_KEY_ID,
      secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    });

    return {
      provider,
      configured,
      mode: "durable",
    };
  }

  return { provider: "local", configured: true, mode: "durable" };
};

export const getStorageProvider = () => {
  const env = keys();

  if (env.STORAGE_PROVIDER === "memory") {
    return createMemoryStorageProvider();
  }

  if (env.STORAGE_PROVIDER === "s3" || env.STORAGE_PROVIDER === "r2") {
    if (env.S3_BUCKET && env.S3_REGION && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY) {
      return createS3StorageProvider({
        bucket: env.S3_BUCKET,
        region: env.S3_REGION,
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
        ...(env.S3_ENDPOINT ? { endpoint: env.S3_ENDPOINT } : {}),
        ...(env.S3_FORCE_PATH_STYLE === undefined ? {} : { forcePathStyle: env.S3_FORCE_PATH_STYLE }),
      });
    }

    return createLocalStorageProvider(env.LOCAL_STORAGE_DIR);
  }

  return createLocalStorageProvider(env.LOCAL_STORAGE_DIR);
};
