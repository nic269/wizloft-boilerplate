import type { StorageProvider, StoredObjectBody } from "../provider";

export const createMemoryStorageProvider = (): StorageProvider => {
	const objects = new Map<string, StoredObjectBody>();

	return {
		async putObject(input) {
			const stored = {
				key: input.key,
				body: input.body,
				sizeBytes: input.body.byteLength,
				contentType: input.contentType,
				provider: "memory",
			};
			objects.set(input.key, stored);
			return stored;
		},
		async getObject(input) {
			const object = objects.get(input.key);
			if (!object) {
				throw new Error(`Object not found: ${input.key}`);
			}
			return object;
		},
		async deleteObject(input) {
			objects.delete(input.key);
		},
	};
};
