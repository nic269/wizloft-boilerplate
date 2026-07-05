import { acceptInvitation, InvitationError, type InvitationErrorCode } from "@repo/auth/invitations";
import { getCurrentSession } from "@repo/auth/session";
import { Hono } from "hono";
import { z } from "zod";
import { ApiError } from "../errors";

const acceptInvitationSchema = z.object({ token: z.string().min(32).max(256) });

const errorStatus: Record<InvitationErrorCode, 404 | 409 | 410 | 403> = {
	INVITATION_NOT_FOUND: 404,
	INVITATION_NOT_PENDING: 409,
	INVITATION_EXPIRED: 410,
	INVITATION_EMAIL_MISMATCH: 403,
};

export const invitationsRouter = new Hono().post("/accept", async (context) => {
	const session = await getCurrentSession(context.req.raw.headers);
	if (!session) {
		throw new ApiError("UNAUTHORIZED", "Authentication required.", 401);
	}
	const parsed = acceptInvitationSchema.safeParse(await context.req.json().catch(() => null));
	if (!parsed.success) {
		throw new ApiError("VALIDATION_ERROR", "Invalid invitation token.", 422, parsed.error.flatten());
	}

	try {
		const organization = await acceptInvitation({
			token: parsed.data.token,
			userId: session.user.id,
			userEmail: session.user.email,
		});
		return context.json({ data: { organization } });
	} catch (error) {
		if (error instanceof InvitationError) {
			throw new ApiError(error.code, error.message, errorStatus[error.code]);
		}
		throw error;
	}
});
