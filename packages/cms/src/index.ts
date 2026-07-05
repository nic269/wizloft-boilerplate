export * from "./env";

export type ContentDocument = {
	slug: string;
	title: string;
	description?: string;
	body: string;
};
