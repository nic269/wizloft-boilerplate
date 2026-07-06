import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, normalize } from "node:path";
import type { StorageProvider } from "../provider";

const PARENT_DIRECTORY_PREFIX_PATTERN = /^(\.\.(\/|\\|$))+/;

export const createLocalStorageProvider = (root = ".data/storage"): StorageProvider => {
  const resolveKey = (key: string) => join(root, normalize(key).replace(PARENT_DIRECTORY_PREFIX_PATTERN, ""));

  return {
    async putObject(input) {
      const path = resolveKey(input.key);
      await mkdir(dirname(path), { recursive: true });
      await writeFile(path, input.body);
      return {
        key: input.key,
        sizeBytes: input.body.byteLength,
        contentType: input.contentType,
        provider: "local",
      };
    },
    async getObject(input) {
      const body = await readFile(resolveKey(input.key));
      return {
        key: input.key,
        body,
        sizeBytes: body.byteLength,
        contentType: "application/octet-stream",
        provider: "local",
      };
    },
    async deleteObject(input) {
      await rm(resolveKey(input.key), { force: true });
    },
  };
};
