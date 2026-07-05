export type JobPayload = Record<string, unknown>;

export type JobDefinition<TPayload extends JobPayload = JobPayload> = {
	name: string;
	timeoutMs?: number;
	retry?: { attempts: number; delayMs: number };
	handler(payload: TPayload): Promise<void>;
};

export type EnqueueJobInput<TPayload extends JobPayload = JobPayload> = {
	name: string;
	payload: TPayload;
	idempotencyKey?: string;
};

export type JobQueueProvider = {
	register<TPayload extends JobPayload>(definition: JobDefinition<TPayload>): void;
	enqueue<TPayload extends JobPayload>(input: EnqueueJobInput<TPayload>): Promise<{ runId: string }>;
};

export const createLocalJobProvider = (): JobQueueProvider => {
	const definitions = new Map<string, JobDefinition>();

	return {
		register(definition) {
			definitions.set(definition.name, definition);
		},
		async enqueue(input) {
			const runId = crypto.randomUUID();
			const definition = definitions.get(input.name);
			if (!definition) {
				throw new Error(`Job definition not registered: ${input.name}`);
			}
			queueMicrotask(() => {
				void definition.handler(input.payload);
			});
			return { runId };
		},
	};
};
