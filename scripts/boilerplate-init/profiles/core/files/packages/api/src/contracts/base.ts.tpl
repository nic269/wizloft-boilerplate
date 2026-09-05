import { oc } from "@orpc/contract";
import { z } from "zod";

export const apiErrorDataSchema = z.unknown().optional();

export const apiContract = oc.errors({
  CONFLICT: { data: apiErrorDataSchema, status: 409 },
  FORBIDDEN: { data: apiErrorDataSchema, status: 403 },
  NOT_FOUND: { data: apiErrorDataSchema, status: 404 },
  SERVICE_UNAVAILABLE: { data: apiErrorDataSchema, status: 503 },
  UNAUTHORIZED: { data: apiErrorDataSchema, status: 401 },
  VALIDATION_ERROR: { data: apiErrorDataSchema, status: 422 },
});

export const emptyInputSchema = z.object({});

export const dataEnvelope = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.object({ data: schema });
