import { createInvitation, InvitationError, listInvitations, revokeInvitation } from "@repo/auth/invitations";
import { keys } from "@repo/auth/keys";
import {
	createOrganizationForUser,
	isUniqueConstraintError,
	listOrganizationsForUser,
	normalizeOrganizationSlug,
} from "@repo/auth/organizations";
import { hasPermission } from "@repo/auth/permissions";
import { getCurrentSession } from "@repo/auth/session";
import { sendMail } from "@repo/mail";
import { Hono } from "hono";
import { z } from "zod";
import { ApiError } from "../errors";

const createOrganizationSchema = z.object({
	name: z.string().trim().min(2).max(80),
	slug: z.string().trim().max(80).optional(),
});

const createInvitationSchema = z.object({ email: z.string().trim().email().max(254) });

const requireUser = async (headers: Headers) => {
	const session = await getCurrentSession(headers);
	if (!session) {
		throw new ApiError("UNAUTHORIZED", "Authentication required.", 401);
	}
	return session.user;
};

const requireOrganizationPermission = async (userId: string, organizationId: string, action: string) => {
	if (!(await hasPermission({ userId, organizationId, module: "members", action }))) {
		throw new ApiError("FORBIDDEN", "You do not have permission to manage invitations.", 403);
	}
};

export const organizationsRouter = new Hono()
	.get("/", async (context) => {
		const user = await requireUser(context.req.raw.headers);
		const organizations = await listOrganizationsForUser(user.id);

		return context.json({
			data: organizations.map(({ memberships, ...organization }) => ({
				...organization,
				role: memberships[0]?.role?.name ?? null,
			})),
		});
	})
	.post("/", async (context) => {
		const user = await requireUser(context.req.raw.headers);
		const body = await context.req.json().catch(() => null);
		const parsed = createOrganizationSchema.safeParse(body);

		if (!parsed.success) {
			throw new ApiError("VALIDATION_ERROR", "Invalid organization details.", 422, parsed.error.flatten());
		}

		const slug = normalizeOrganizationSlug(parsed.data.slug ?? parsed.data.name);
		if (!slug) {
			throw new ApiError("VALIDATION_ERROR", "Organization slug must contain letters or numbers.", 422);
		}

		try {
			const organization = await createOrganizationForUser({
				userId: user.id,
				name: parsed.data.name,
				slug,
			});
			return context.json({ data: organization }, 201);
		} catch (error) {
			if (isUniqueConstraintError(error)) {
				throw new ApiError("CONFLICT", "That organization slug is already in use.", 409);
			}
			throw error;
		}
	})
	.get("/:organizationId/invitations", async (context) => {
		const user = await requireUser(context.req.raw.headers);
		const organizationId = context.req.param("organizationId");
		await requireOrganizationPermission(user.id, organizationId, "read");
		return context.json({ data: await listInvitations(organizationId) });
	})
	.post("/:organizationId/invitations", async (context) => {
		const user = await requireUser(context.req.raw.headers);
		const organizationId = context.req.param("organizationId");
		await requireOrganizationPermission(user.id, organizationId, "invite");
		const parsed = createInvitationSchema.safeParse(await context.req.json().catch(() => null));
		if (!parsed.success) {
			throw new ApiError("VALIDATION_ERROR", "Enter a valid email address.", 422, parsed.error.flatten());
		}

		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
		const { invitation, token } = await createInvitation({
			organizationId,
			email: parsed.data.email,
			invitedById: user.id,
			expiresAt,
		});
		const acceptUrl = new URL(`/invite/${token}`, keys().NEXT_PUBLIC_APP_URL).toString();
		let delivery: "sent" | "failed" = "sent";
		try {
			await sendMail({
				to: invitation.email,
				subject: "You have been invited to an organization",
				text: `Accept your invitation: ${acceptUrl}`,
			});
		} catch (error) {
			delivery = "failed";
			context.get("logger").error("invitation.delivery_failed", {
				invitationId: invitation.id,
				message: error instanceof Error ? error.message : "Unknown mail error",
			});
		}

		return context.json(
			{
				data: {
					id: invitation.id,
					email: invitation.email,
					status: invitation.status,
					expiresAt: invitation.expiresAt,
					acceptUrl,
					delivery,
				},
			},
			201,
		);
	})
	.delete("/:organizationId/invitations/:invitationId", async (context) => {
		const user = await requireUser(context.req.raw.headers);
		const organizationId = context.req.param("organizationId");
		await requireOrganizationPermission(user.id, organizationId, "invite");
		try {
			await revokeInvitation({
				organizationId,
				invitationId: context.req.param("invitationId"),
				actorId: user.id,
			});
			return context.body(null, 204);
		} catch (error) {
			if (error instanceof InvitationError) {
				throw new ApiError("INVITATION_NOT_FOUND", error.message, 404);
			}
			throw error;
		}
	});
