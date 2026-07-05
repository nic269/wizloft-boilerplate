export * from "./keys";
export * from "./provider";
export * from "./providers/local";
export * from "./providers/memory";

import { keys } from "./keys";
import { createLocalStorageProvider } from "./providers/local";
import { createMemoryStorageProvider } from "./providers/memory";

export const getStorageProvider = () => {
	const env = keys();

	if (env.STORAGE_PROVIDER === "memory") {
		return createMemoryStorageProvider();
	}

	return createLocalStorageProvider(env.LOCAL_STORAGE_DIR);
};
