export * from "./env";
export * from "./provider";
export * from "./providers/local";
export * from "./providers/memory";

import { createLocalStorageProvider } from "./providers/local";
import { createMemoryStorageProvider } from "./providers/memory";

export const getStorageProvider = () => {
	if (process.env.STORAGE_PROVIDER === "memory") {
		return createMemoryStorageProvider();
	}

	return createLocalStorageProvider();
};
