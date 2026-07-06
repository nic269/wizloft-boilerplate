import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getStorageProvider, getStorageProviderStatus } from ".";
import { buildTenantObjectKey, sanitizeObjectKeySegment } from "./provider";
import { isS3StorageConfigured } from "./providers/s3";

const ORGANIZATION_OBJECT_KEY_PATTERN = /^org\/org\/[a-f0-9-]+-debug.csv$/;

describe("storage provider", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("sanitizes tenant object keys", () => {
    expect(sanitizeObjectKeySegment("../invoice final.pdf")).toBe("invoice-final.pdf");
    expect(buildTenantObjectKey({ organizationId: "../org", fileName: "../../debug.csv" })).toMatch(
      ORGANIZATION_OBJECT_KEY_PATTERN,
    );
  });

  it("uses local storage by default", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-storage-"));
    vi.stubEnv("LOCAL_STORAGE_DIR", root);
    const provider = getStorageProvider();

    await provider.putObject({
      key: "org/acme/file.txt",
      body: new TextEncoder().encode("hello"),
      contentType: "text/plain",
    });

    await expect(readFile(join(root, "org/acme/file.txt"), "utf8")).resolves.toBe("hello");
    await expect(provider.getObject({ key: "org/acme/file.txt" })).resolves.toMatchObject({
      key: "org/acme/file.txt",
      provider: "local",
    });
  });

  it("reports missing s3 credentials without throwing and falls back locally", async () => {
    const root = await mkdtemp(join(tmpdir(), "wizloft-storage-"));
    vi.stubEnv("STORAGE_PROVIDER", "s3");
    vi.stubEnv("LOCAL_STORAGE_DIR", root);
    vi.stubEnv("S3_BUCKET", "private-files");

    expect(getStorageProviderStatus()).toEqual({ provider: "s3", configured: false, mode: "durable" });
    await expect(
      getStorageProvider().putObject({
        key: "global/test.txt",
        body: new TextEncoder().encode("fallback"),
        contentType: "text/plain",
      }),
    ).resolves.toMatchObject({ provider: "local" });
  });

  it("detects complete s3 configuration", () => {
    expect(
      isS3StorageConfigured({
        bucket: "bucket",
        region: "auto",
        accessKeyId: "key",
        secretAccessKey: "secret",
      }),
    ).toBe(true);
  });
});
