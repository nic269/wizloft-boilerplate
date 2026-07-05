import { z } from "zod";

type EnvShape = Record<string, z.ZodType>;
type EmptyEnvShape = Record<string, never>;

type CreateEnvInput<Server extends EnvShape, Client extends EnvShape> = {
	server?: Server;
	client?: Client;
	runtimeEnv?: Record<string, string | undefined>;
	skipValidation?: boolean;
};

export type EnvSchema = {
	server?: EnvShape;
	client?: EnvShape;
	optionalServer?: EnvShape;
	optionalClient?: EnvShape;
};

export const createEnv = <Server extends EnvShape = EmptyEnvShape, Client extends EnvShape = EmptyEnvShape>(
	input: CreateEnvInput<Server, Client>,
): z.infer<z.ZodObject<Server & Client>> => {
	const schema = z.object({ ...(input.server ?? {}), ...(input.client ?? {}) } as Server & Client);
	const runtimeEnv = input.runtimeEnv ?? process.env;

	if (input.skipValidation) {
		return runtimeEnv as z.infer<z.ZodObject<Server & Client>>;
	}

	return schema.parse(runtimeEnv);
};

export const optionalString = z.string().min(1).optional();
export { z };
