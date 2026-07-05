import { z } from "@repo/env";

export const storageEnv = {
	optionalServer: {
		STORAGE_PROVIDER: z.enum(["local", "memory", "s3", "r2"]).optional(),
		LOCAL_STORAGE_DIR: z.string().min(1).optional(),
		S3_BUCKET: z.string().min(1).optional(),
		S3_REGION: z.string().min(1).optional(),
		S3_ENDPOINT: z.string().url().optional(),
		S3_ACCESS_KEY_ID: z.string().min(1).optional(),
		S3_SECRET_ACCESS_KEY: z.string().min(1).optional(),
	},
};
