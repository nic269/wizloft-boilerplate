export const openApiDocument = {
	openapi: "3.1.0",
	info: {
		title: "Personal SaaS Boilerplate API",
		version: "0.1.0",
	},
	paths: {
		"/status": {
			get: {
				summary: "Service status",
				responses: {
					"200": {
						description: "Service is running",
					},
				},
			},
		},
		"/health": {
			get: {
				summary: "Health check",
				responses: {
					"200": {
						description: "Service is healthy",
					},
				},
			},
		},
		"/ready": {
			get: {
				summary: "Readiness check",
				responses: {
					"200": {
						description: "Service is ready",
					},
				},
			},
		},
	},
} as const;
