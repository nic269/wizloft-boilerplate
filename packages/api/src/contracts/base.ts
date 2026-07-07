import { oc } from "@orpc/contract";
import { z } from "zod";

export const apiErrorDataSchema = z.unknown().optional();

export const apiContract = oc.errors({
  CONFLICT: { data: apiErrorDataSchema, status: 409 },
  FORBIDDEN: { data: apiErrorDataSchema, status: 403 },
  INVITATION_EMAIL_MISMATCH: { data: apiErrorDataSchema, status: 403 },
  INVITATION_EXPIRED: { data: apiErrorDataSchema, status: 410 },
  INVITATION_NOT_FOUND: { data: apiErrorDataSchema, status: 404 },
  INVITATION_NOT_PENDING: { data: apiErrorDataSchema, status: 409 },
  NOT_FOUND: { data: apiErrorDataSchema, status: 404 },
  UNAUTHORIZED: { data: apiErrorDataSchema, status: 401 },
  VALIDATION_ERROR: { data: apiErrorDataSchema, status: 422 },
});

export const emptyInputSchema = z.object({});

export const dataEnvelope = <TSchema extends z.ZodType>(schema: TSchema) =>
  z.object({ data: schema });
