export type JobPayload = Record<string, unknown>;
export type JobRunStatus = "queued" | "running" | "completed" | "failed";

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

export type JobRunRecord = {
	runId: string;
	name: string;
	status: JobRunStatus;
	attempts: number;
	idempotencyKey?: string;
	error?: string;
	queuedAt: Date;
	startedAt?: Date;
	completedAt?: Date;
	failedAt?: Date;
};

export type JobQueueProvider = {
	register<TPayload extends JobPayload>(definition: JobDefinition<TPayload>): void;
	enqueue<TPayload extends JobPayload>(input: EnqueueJobInput<TPayload>): Promise<{ runId: string }>;
	getRun(runId: string): JobRunRecord | undefined;
	listRuns(): JobRunRecord[];
	waitUntilIdle(): Promise<void>;
};

export const getJobProviderStatus = () =>
	({
		provider: "local",
		configured: true,
		mode: "in-process",
	}) as const;

export const createLocalJobProvider = (): JobQueueProvider => {
	const definitions = new Map<string, JobDefinition>();
	const runs = new Map<string, JobRunRecord>();
	const idempotency = new Map<string, string>();
	const pending = new Set<Promise<void>>();

	const delay = (delayMs: number) => new Promise((resolve) => setTimeout(resolve, delayMs));

	const execute = async (runId: string, definition: JobDefinition, payload: JobPayload) => {
		const run = runs.get(runId);
		if (!run) return;

		run.status = "running";
		run.startedAt = new Date();
		const maxAttempts = definition.retry?.attempts ?? 1;

		for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
			run.attempts = attempt;
			try {
				await definition.handler(payload);
				run.status = "completed";
				run.completedAt = new Date();
				delete run.error;
				return;
			} catch (error) {
				run.error = error instanceof Error ? error.message : "Unknown job error";
				if (attempt < maxAttempts) {
					await delay(definition.retry?.delayMs ?? 0);
				}
			}
		}

		run.status = "failed";
		run.failedAt = new Date();
	};

	const schedule = (runId: string, definition: JobDefinition, payload: JobPayload) => {
		const task = execute(runId, definition, payload).finally(() => pending.delete(task));
		pending.add(task);
	};

	return {
		register(definition) {
			definitions.set(definition.name, definition);
		},
		async enqueue(input) {
			const key = input.idempotencyKey ? `${input.name}:${input.idempotencyKey}` : undefined;
			const existingRunId = key ? idempotency.get(key) : undefined;
			if (existingRunId) {
				return { runId: existingRunId };
			}

			const definition = definitions.get(input.name);
			if (!definition) {
				throw new Error(`Job definition not registered: ${input.name}`);
			}

			const runId = crypto.randomUUID();
			runs.set(runId, {
				runId,
				name: input.name,
				status: "queued",
				attempts: 0,
				queuedAt: new Date(),
				...(input.idempotencyKey ? { idempotencyKey: input.idempotencyKey } : {}),
			});
			if (key) idempotency.set(key, runId);
			schedule(runId, definition, input.payload);

			return { runId };
		},
		getRun(runId) {
			return runs.get(runId);
		},
		listRuns() {
			return [...runs.values()].sort((left, right) => left.queuedAt.getTime() - right.queuedAt.getTime());
		},
		async waitUntilIdle() {
			while (pending.size > 0) {
				await Promise.all([...pending]);
			}
		},
	};
};
