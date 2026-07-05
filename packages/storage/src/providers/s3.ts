import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { StorageProvider } from "../provider";

export type S3StorageConfig = {
	bucket: string;
	region: string;
	endpoint?: string;
	accessKeyId?: string;
	secretAccessKey?: string;
	forcePathStyle?: boolean;
};

type S3StorageConfigInput = { [Key in keyof S3StorageConfig]?: S3StorageConfig[Key] | undefined };

export const isS3StorageConfigured = (config: S3StorageConfigInput) =>
	Boolean(config.bucket && config.region && config.accessKeyId && config.secretAccessKey);

export const createS3StorageProvider = (config: S3StorageConfig): StorageProvider => {
	if (!isS3StorageConfigured(config)) {
		throw new Error("S3 storage requires bucket, region, access key, and secret key.");
	}

	const client = new S3Client({
		region: config.region,
		forcePathStyle: config.forcePathStyle ?? Boolean(config.endpoint),
		credentials: {
			accessKeyId: config.accessKeyId ?? "",
			secretAccessKey: config.secretAccessKey ?? "",
		},
		...(config.endpoint ? { endpoint: config.endpoint } : {}),
	});

	return {
		async putObject(input) {
			await client.send(
				new PutObjectCommand({
					Bucket: config.bucket,
					Key: input.key,
					Body: input.body,
					ContentType: input.contentType,
					Metadata: input.metadata,
					ServerSideEncryption: "AES256",
				}),
			);

			return {
				key: input.key,
				sizeBytes: input.body.byteLength,
				contentType: input.contentType,
				provider: "s3",
			};
		},
		async getObject(input) {
			const response = await client.send(new GetObjectCommand({ Bucket: config.bucket, Key: input.key }));
			const body = response.Body ? new Uint8Array(await response.Body.transformToByteArray()) : new Uint8Array();
			return {
				key: input.key,
				body,
				sizeBytes: body.byteLength,
				contentType: response.ContentType ?? "application/octet-stream",
				provider: "s3",
			};
		},
		async deleteObject(input) {
			await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: input.key }));
		},
		async getSignedUploadUrl(input) {
			const expiresInSeconds = input.expiresInSeconds ?? 900;
			const command = new PutObjectCommand({
				Bucket: config.bucket,
				Key: input.key,
				ContentType: input.contentType,
				ServerSideEncryption: "AES256",
			});
			return {
				url: await getSignedUrl(client, command, { expiresIn: expiresInSeconds }),
				headers: { "content-type": input.contentType, "x-amz-server-side-encryption": "AES256" },
				expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
			};
		},
		async getSignedDownloadUrl(input) {
			const expiresInSeconds = input.expiresInSeconds ?? 900;
			const command = new GetObjectCommand({ Bucket: config.bucket, Key: input.key });
			return {
				url: await getSignedUrl(client, command, { expiresIn: expiresInSeconds }),
				expiresAt: new Date(Date.now() + expiresInSeconds * 1000),
			};
		},
	};
};
