export * from "./keys";

export type ContentDocument = {
	slug: string;
	title: string;
	description?: string;
	body: string;
};
