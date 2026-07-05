export const plans = [
	{
		id: "free",
		name: "Free",
		features: ["basic"],
		limits: { projects: 1, storageMb: 100 },
	},
	{
		id: "pro",
		name: "Pro",
		features: ["basic", "advanced"],
		limits: { projects: 10, storageMb: 10_000 },
	},
] as const;
