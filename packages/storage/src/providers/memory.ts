import type { StorageProvider, StoredObjectBody } from "../provider";

export const createMemoryStorageProvider = (): StorageProvider => {
  const objects = new Map<string, StoredObjectBody>();

  return {
    putObject(input) {
      const stored = {
        key: input.key,
        body: input.body,
        sizeBytes: input.body.byteLength,
        contentType: input.contentType,
        provider: "memory",
      };
      objects.set(input.key, stored);
      return Promise.resolve(stored);
    },
    getObject(input) {
      const object = objects.get(input.key);
      if (!object) {
        return Promise.reject(new Error(`Object not found: ${input.key}`));
      }
      return Promise.resolve(object);
    },
    deleteObject(input) {
      objects.delete(input.key);
      return Promise.resolve();
    },
  };
};
