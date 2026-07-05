import { z } from "@repo/env";

export const cmsEnv = {
	optionalServer: {
		CMS_TOKEN: z.string().min(1).optional(),
	},
};
