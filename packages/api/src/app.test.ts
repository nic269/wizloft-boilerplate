import { createRole, listAuditLogs, listMembers, listRoles, updateMemberRole } from "@repo/auth/access-control";
import { acceptInvitation, createInvitation } from "@repo/auth/invitations";
import { createOrganizationForUser, listOrganizationsForUser } from "@repo/auth/organizations";
import { hasPermission } from "@repo/auth/permissions";
import { getCurrentSession } from "@repo/auth/session";
import { sendMail } from "@repo/mail";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiApp } from "./app";

vi.mock("@repo/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@repo/auth/keys", () => ({ keys: () => ({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }) }));
vi.mock("@repo/auth/server", () => ({
	auth: { handler: vi.fn(() => new Response(null, { status: 204 })) },
}));
vi.mock("@repo/auth/organizations", () => ({
	createOrganizationForUser: vi.fn(),
	isUniqueConstraintError: (error: unknown) =>
		typeof error === "object" && error !== null && "code" in error && error.code === "P2002",
	listOrganizationsForUser: vi.fn(),
	normalizeOrganizationSlug: (value: string) =>
		value
			.trim()
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, ""),
}));
vi.mock("@repo/auth/invitations", () => ({
	acceptInvitation: vi.fn(),
	createInvitation: vi.fn(),
	InvitationError: class InvitationError extends Error {
		constructor(
			public code: string,
			message: string,
		) {
			super(message);
		}
	},
	listInvitations: vi.fn(),
	revokeInvitation: vi.fn(),
}));
vi.mock("@repo/auth/access-control", () => ({
	createRole: vi.fn(),
	isKnownPermission: (permission: { module: string; action: string }) =>
		[
			"organization:read",
			"organization:update",
			"members:read",
			"members:invite",
			"members:manage",
			"roles:read",
			"roles:manage",
			"audit:read",
		].includes(`${permission.module}:${permission.action}`),
	listAuditLogs: vi.fn(),
	listMembers: vi.fn(),
	listRoles: vi.fn(),
	updateMemberRole: vi.fn(),
}));
vi.mock("@repo/auth/permissions", () => ({ hasPermission: vi.fn() }));
vi.mock("@repo/mail", () => ({ sendMail: vi.fn() }));

describe("api app", () => {
	beforeEach(() => vi.clearAllMocks());

	it("serves status", async () => {
		const response = await createApiApp().request("/status");
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({ ok: true, service: "api" });
	});

	it("serves typed RPC status procedure", async () => {
		const response = await createApiApp().request("/rpc/status.get");
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({ data: { ok: true, service: "api" } });
	});

	it("returns structured errors for unknown RPC procedures", async () => {
		const response = await createApiApp().request("/rpc/missing.get");
		expect(response.status).toBe(404);
		expect(await response.json()).toMatchObject({ error: { code: "RPC_NOT_FOUND" } });
	});

	it("publishes OpenAPI paths from the contract registry", async () => {
		const response = await createApiApp().request("/openapi.json");
		expect(response.status).toBe(200);
		const document = await response.json();
		expect(document.paths["/status"].get.operationId).toBe("status.get.rest");
		expect(document.paths["/rpc/status.get"].get.operationId).toBe("status.get.rpc");
	});

	it("rejects anonymous organization access", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue(null);
		const response = await createApiApp().request("/api/organizations");

		expect(response.status).toBe(401);
		expect(await response.json()).toMatchObject({ error: { code: "UNAUTHORIZED" } });
	});

	it("lists only organizations returned for the authenticated user", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(listOrganizationsForUser).mockResolvedValue([
			{
				id: "org-1",
				name: "Acme",
				slug: "acme",
				memberships: [{ role: { name: "Owner" } }],
			},
		]);

		const response = await createApiApp().request("/api/organizations");
		expect(response.status).toBe(200);
		expect(listOrganizationsForUser).toHaveBeenCalledWith("user-1");
		expect(await response.json()).toEqual({
			data: [{ id: "org-1", name: "Acme", slug: "acme", role: "Owner" }],
		});
	});

	it("creates an organization for the authenticated user", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(createOrganizationForUser).mockResolvedValue({
			id: "org-1",
			name: "Acme Studio",
			slug: "acme-studio",
			role: "Owner",
		});

		const response = await createApiApp().request("/api/organizations", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ name: "Acme Studio" }),
		});

		expect(response.status).toBe(201);
		expect(createOrganizationForUser).toHaveBeenCalledWith({
			userId: "user-1",
			name: "Acme Studio",
			slug: "acme-studio",
		});
	});

	it("prevents members without invite permission from creating invitations", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(false);

		const response = await createApiApp().request("/api/organizations/org-1/invitations", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: "member@example.com" }),
		});
		expect(response.status).toBe(403);
		expect(createInvitation).not.toHaveBeenCalled();
	});

	it("creates and delivers an invitation for an authorized owner", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "owner-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(true);
		vi.mocked(createInvitation).mockResolvedValue({
			token: "a".repeat(43),
			invitation: {
				id: "invite-1",
				email: "member@example.com",
				status: "PENDING",
				expiresAt: new Date("2030-01-01T00:00:00.000Z"),
			} as never,
		});
		vi.mocked(sendMail).mockResolvedValue({ id: "mail-1", provider: "console" });

		const response = await createApiApp().request("/api/organizations/org-1/invitations", {
			method: "POST",
			headers: { "content-type": "application/json", origin: "http://localhost:3000" },
			body: JSON.stringify({ email: "member@example.com" }),
		});

		expect(response.status).toBe(201);
		expect(sendMail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: "member@example.com",
				text: expect.stringContaining("http://localhost:3000/invite/"),
			}),
		);
		expect(JSON.stringify(await response.json())).not.toContain("tokenHash");
	});

	it("binds invitation acceptance to the authenticated user", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({
			user: { id: "user-1", email: "member@example.com" },
		} as never);
		vi.mocked(acceptInvitation).mockResolvedValue({ id: "org-1", name: "Acme", slug: "acme" });

		const response = await createApiApp().request("/api/invitations/accept", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ token: "a".repeat(43) }),
		});

		expect(response.status).toBe(200);
		expect(acceptInvitation).toHaveBeenCalledWith({
			token: "a".repeat(43),
			userId: "user-1",
			userEmail: "member@example.com",
		});
	});

	it("requires role read permission before listing roles", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(false);

		const response = await createApiApp().request("/api/organizations/org-1/roles");

		expect(response.status).toBe(403);
		expect(hasPermission).toHaveBeenCalledWith({
			userId: "user-1",
			organizationId: "org-1",
			module: "roles",
			action: "read",
		});
		expect(listRoles).not.toHaveBeenCalled();
	});

	it("creates roles through catalog permissions and audit-aware service", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "owner-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(true);
		vi.mocked(createRole).mockResolvedValue({
			id: "role-1",
			name: "Manager",
			description: null,
			permissions: [{ module: "members", action: "read" }],
			_count: { memberships: 0 },
		} as never);

		const response = await createApiApp().request("/api/organizations/org-1/roles", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: "Manager",
				permissions: [{ module: "members", action: "read" }],
			}),
		});

		expect(response.status).toBe(201);
		expect(createRole).toHaveBeenCalledWith({
			organizationId: "org-1",
			name: "Manager",
			permissions: [{ module: "members", action: "read" }],
			actorId: "owner-1",
		});
	});

	it("updates member roles inside the organization boundary", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "owner-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(true);
		vi.mocked(updateMemberRole).mockResolvedValue(undefined);

		const response = await createApiApp().request("/api/organizations/org-1/members/member-1/role", {
			method: "PATCH",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ roleId: "role-2" }),
		});

		expect(response.status).toBe(204);
		expect(updateMemberRole).toHaveBeenCalledWith({
			organizationId: "org-1",
			membershipId: "member-1",
			roleId: "role-2",
			actorId: "owner-1",
		});
	});

	it("requires audit read permission before exposing audit logs", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(true);
		vi.mocked(listAuditLogs).mockResolvedValue([{ id: "audit-1", action: "role.created" }] as never);

		const response = await createApiApp().request("/api/organizations/org-1/audit-logs");

		expect(response.status).toBe(200);
		expect(hasPermission).toHaveBeenCalledWith({
			userId: "user-1",
			organizationId: "org-1",
			module: "audit",
			action: "read",
		});
		expect(listAuditLogs).toHaveBeenCalledWith("org-1");
	});

	it("lists members through member read permission", async () => {
		vi.mocked(getCurrentSession).mockResolvedValue({ user: { id: "user-1" } } as never);
		vi.mocked(hasPermission).mockResolvedValue(true);
		vi.mocked(listMembers).mockResolvedValue([]);

		const response = await createApiApp().request("/api/organizations/org-1/members");

		expect(response.status).toBe(200);
		expect(listMembers).toHaveBeenCalledWith("org-1");
	});
});
