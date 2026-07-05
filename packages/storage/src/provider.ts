export type PutObjectInput = {
	key: string;
	body: Uint8Array;
	contentType: string;
	metadata?: Record<string, string>;
};

export type StoredObject = {
	key: string;
	sizeBytes: number;
	contentType: string;
	provider: string;
};

export type GetObjectInput = {
	key: string;
};

export type StoredObjectBody = StoredObject & {
	body: Uint8Array;
};

export type DeleteObjectInput = {
	key: string;
};

export type SignedUploadInput = {
	key: string;
	contentType: string;
	expiresInSeconds?: number;
};

export type SignedDownloadInput = {
	key: string;
	expiresInSeconds?: number;
};

export type SignedUpload = {
	url: string;
	headers?: Record<string, string>;
	expiresAt: Date;
};

export type SignedDownload = {
	url: string;
	expiresAt: Date;
};

export type StorageProvider = {
	putObject(input: PutObjectInput): Promise<StoredObject>;
	getObject(input: GetObjectInput): Promise<StoredObjectBody>;
	deleteObject(input: DeleteObjectInput): Promise<void>;
	getSignedUploadUrl?(input: SignedUploadInput): Promise<SignedUpload>;
	getSignedDownloadUrl?(input: SignedDownloadInput): Promise<SignedDownload>;
};

export const buildTenantObjectKey = (input: { organizationId?: string; ownerId?: string; fileName: string }) => {
	const scope = input.organizationId
		? `org/${input.organizationId}`
		: input.ownerId
			? `user/${input.ownerId}`
			: "global";
	return `${scope}/${crypto.randomUUID()}-${input.fileName}`;
};
