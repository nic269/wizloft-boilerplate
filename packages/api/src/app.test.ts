import {
  createRole,
  listAuditLogs,
  listMembers,
  listRoles,
  updateMemberRole,
} from "@repo/auth/access-control";
import { acceptInvitation, createInvitation } from "@repo/auth/invitations";
import {
  createOrganizationForUser,
  listOrganizationsForUser,
} from "@repo/auth/organizations";
import { hasPermission } from "@repo/auth/permissions";
import { getCurrentSession } from "@repo/auth/session";
import { prisma } from "@repo/database";
import { sendMail } from "@repo/mail";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApiApp } from "./app";

vi.mock("@repo/auth/session", () => ({ getCurrentSession: vi.fn() }));
vi.mock("@repo/auth/keys", () => ({
  keys: () => ({ NEXT_PUBLIC_APP_URL: "http://localhost:3000" }),
}));
vi.mock("@repo/auth/server", () => ({
  auth: { handler: vi.fn(() => new Response(null, { status: 204 })) },
}));
vi.mock("@repo/auth/organizations", () => ({
  createOrganizationForUser: vi.fn(),
  isUniqueConstraintError: (error: unknown) =>
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002",
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
    code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
  listInvitations: vi.fn(),
  revokeInvitation: vi.fn(),
}));
vi.mock("@repo/auth/access-control", () => ({
  createRole: vi.fn(),
  listAuditLogs: vi.fn(),
  listMembers: vi.fn(),
  listRoles: vi.fn(),
  updateMemberRole: vi.fn(),
}));
vi.mock("@repo/auth/permissions", () => ({ hasPermission: vi.fn() }));
vi.mock("@repo/database", () => ({
  prisma: { $queryRaw: vi.fn() },
}));
vi.mock("@repo/mail", () => ({
  getMailProviderStatus: () => ({
    configured: true,
    mode: "development",
    provider: "console",
  }),
  sendMail: vi.fn(),
}));
vi.mock("@repo/storage", () => ({
  getStorageProviderStatus: () => ({
    configured: true,
    mode: "durable",
    provider: "local",
  }),
}));
vi.mock("@repo/jobs", () => ({
  getJobProviderStatus: () => ({
    configured: true,
    mode: "in-process",
    provider: "local",
  }),
}));

describe("api app", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.$queryRaw).mockResolvedValue([{ "?column?": 1 }]);
  });

  it("serves status", async () => {
    const response = await createApiApp().request("/status");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ ok: true, service: "api" });
  });

  it("serves typed RPC status procedure", async () => {
    const response = await createApiApp().request("/rpc/status.get");
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      data: { ok: true, service: "api" },
    });
  });

  it("serves readiness when required dependencies are healthy", async () => {
    const response = await createApiApp().request("/ready");

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      checks: { database: { healthy: true } },
      ok: true,
      providers: {
        jobs: { configured: true, provider: "local" },
        mail: { configured: true, provider: "console" },
        storage: { configured: true, provider: "local" },
      },
    });
  });

  it("returns service unavailable when readiness dependencies fail", async () => {
    vi.mocked(prisma.$queryRaw).mockRejectedValueOnce(
      new Error("database unavailable")
    );

    const response = await createApiApp().request("/ready");

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: {
        code: "SERVICE_UNAVAILABLE",
        details: { checks: { database: { healthy: false } } },
      },
    });
  });

  it("returns structured errors for unknown RPC procedures", async () => {
    const response = await createApiApp().request("/rpc/missing.get");
    expect(response.status).toBe(404);
    expect(await response.json()).toMatchObject({
      error: { code: "RPC_NOT_FOUND" },
    });
  });

  it("publishes OpenAPI paths from the contract registry", async () => {
    const response = await createApiApp().request("/openapi.json");
    expect(response.status).toBe(200);
    const document = await response.json();
    expect(document.paths["/status"].get.operationId).toBe("status.get.rest");
    expect(document.paths["/rpc/status.get"].get.operationId).toBe(
      "status.get.rpc"
    );
  });

  it("exposes optional provider statuses", async () => {
    const files = await createApiApp().request("/api/files");
    const jobs = await createApiApp().request("/api/jobs");

    expect(files.status).toBe(200);
    expect(await files.json()).toMatchObject({
      data: { configured: true, provider: "local" },
    });
    expect(jobs.status).toBe(200);
    expect(await jobs.json()).toMatchObject({
      data: { configured: true, provider: "local" },
    });
  });

  it("rejects anonymous organization access", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);
    const response = await createApiApp().request("/api/organizations");

    expect(response.status).toBe(401);
    expect(await response.json()).toMatchObject({
      error: { code: "UNAUTHORIZED" },
    });
  });

  it("rejects users that the shared session helper treats as inactive", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue(null);

    const response = await createApiApp().request(
      "/api/organizations/org-1/roles"
    );

    expect(response.status).toBe(401);
    expect(hasPermission).not.toHaveBeenCalled();
    expect(listRoles).not.toHaveBeenCalled();
  });

  it("lists only organizations returned for the authenticated user", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(listOrganizationsForUser).mockResolvedValue([
      {
        id: "org-1",
        memberships: [{ role: { name: "Owner" } }],
        name: "Acme",
        slug: "acme",
      },
    ]);

    const response = await createApiApp().request("/api/organizations");
    expect(response.status).toBe(200);
    expect(listOrganizationsForUser).toHaveBeenCalledWith("user-1");
    expect(await response.json()).toEqual({
      data: [{ id: "org-1", name: "Acme", role: "Owner", slug: "acme" }],
    });
  });

  it("creates an organization for the authenticated user", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(createOrganizationForUser).mockResolvedValue({
      id: "org-1",
      name: "Acme Studio",
      role: "Owner",
      slug: "acme-studio",
    });

    const response = await createApiApp().request("/api/organizations", {
      body: JSON.stringify({ name: "Acme Studio" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(201);
    expect(createOrganizationForUser).toHaveBeenCalledWith({
      name: "Acme Studio",
      slug: "acme-studio",
      userId: "user-1",
    });
  });

  it("normalizes contract input validation to the API error envelope", async () => {
    const response = await createApiApp().request("/api/organizations", {
      body: JSON.stringify({ name: "x" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(422);
    expect(await response.json()).toMatchObject({
      error: { code: "VALIDATION_ERROR" },
    });
  });

  it("prevents members without invite permission from creating invitations", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(false);

    const response = await createApiApp().request(
      "/api/organizations/org-1/invitations",
      {
        body: JSON.stringify({ email: "member@example.com" }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }
    );
    expect(response.status).toBe(403);
    expect(createInvitation).not.toHaveBeenCalled();
  });

  it("creates and delivers an invitation for an authorized owner", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "owner-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(createInvitation).mockResolvedValue({
      invitation: {
        email: "member@example.com",
        expiresAt: new Date("2030-01-01T00:00:00.000Z"),
        id: "invite-1",
        status: "PENDING",
      } as never,
      token: "a".repeat(43),
    });
    vi.mocked(sendMail).mockResolvedValue({
      id: "mail-1",
      provider: "console",
    });

    const response = await createApiApp().request(
      "/api/organizations/org-1/invitations",
      {
        body: JSON.stringify({ email: "member@example.com" }),
        headers: {
          "content-type": "application/json",
          origin: "http://localhost:3000",
        },
        method: "POST",
      }
    );

    expect(response.status).toBe(201);
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("http://localhost:3000/invite/"),
        to: "member@example.com",
      })
    );
    expect(JSON.stringify(await response.json())).not.toContain("tokenHash");
  });

  it("binds invitation acceptance to the authenticated user", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { email: "member@example.com", id: "user-1" },
    } as never);
    vi.mocked(acceptInvitation).mockResolvedValue({
      id: "org-1",
      name: "Acme",
      slug: "acme",
    });

    const response = await createApiApp().request("/api/invitations/accept", {
      body: JSON.stringify({ token: "a".repeat(43) }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(acceptInvitation).toHaveBeenCalledWith({
      token: "a".repeat(43),
      userEmail: "member@example.com",
      userId: "user-1",
    });
  });

  it("requires role read permission before listing roles", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(false);

    const response = await createApiApp().request(
      "/api/organizations/org-1/roles"
    );

    expect(response.status).toBe(403);
    expect(hasPermission).toHaveBeenCalledWith({
      action: "read",
      module: "roles",
      organizationId: "org-1",
      userId: "user-1",
    });
    expect(listRoles).not.toHaveBeenCalled();
  });

  it("creates roles through catalog permissions and audit-aware service", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "owner-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(createRole).mockResolvedValue({
      _count: { memberships: 0 },
      description: null,
      id: "role-1",
      name: "Manager",
      permissions: [{ action: "read", module: "members" }],
    } as never);

    const response = await createApiApp().request(
      "/api/organizations/org-1/roles",
      {
        body: JSON.stringify({
          name: "Manager",
          permissions: [{ action: "read", module: "members" }],
        }),
        headers: { "content-type": "application/json" },
        method: "POST",
      }
    );

    expect(response.status).toBe(201);
    expect(createRole).toHaveBeenCalledWith({
      actorId: "owner-1",
      name: "Manager",
      organizationId: "org-1",
      permissions: [{ action: "read", module: "members" }],
    });
  });

  it("updates member roles inside the organization boundary", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "owner-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(updateMemberRole).mockResolvedValue(undefined);

    const response = await createApiApp().request(
      "/api/organizations/org-1/members/member-1/role",
      {
        body: JSON.stringify({ roleId: "role-2" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }
    );

    expect(response.status).toBe(204);
    expect(updateMemberRole).toHaveBeenCalledWith({
      actorId: "owner-1",
      membershipId: "member-1",
      organizationId: "org-1",
      roleId: "role-2",
    });
  });

  it("returns conflict when a role update would remove the last active owner", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "owner-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(updateMemberRole).mockRejectedValue(
      new Error("LAST_OWNER_REQUIRED")
    );

    const response = await createApiApp().request(
      "/api/organizations/org-1/members/member-1/role",
      {
        body: JSON.stringify({ roleId: "role-2" }),
        headers: { "content-type": "application/json" },
        method: "PATCH",
      }
    );

    expect(response.status).toBe(409);
    expect(await response.json()).toMatchObject({
      error: {
        code: "CONFLICT",
        message: "An organization must keep at least one active Owner.",
      },
    });
  });

  it("requires audit read permission before exposing audit logs", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(listAuditLogs).mockResolvedValue([
      {
        action: "role.created",
        actor: null,
        createdAt: new Date("2030-01-01T00:00:00.000Z"),
        id: "audit-1",
        metadata: null,
        targetId: "role-1",
        targetType: "Role",
      },
    ] as never);

    const response = await createApiApp().request(
      "/api/organizations/org-1/audit-logs"
    );

    expect(response.status).toBe(200);
    expect(hasPermission).toHaveBeenCalledWith({
      action: "read",
      module: "audit",
      organizationId: "org-1",
      userId: "user-1",
    });
    expect(listAuditLogs).toHaveBeenCalledWith("org-1");
  });

  it("lists members through member read permission", async () => {
    vi.mocked(getCurrentSession).mockResolvedValue({
      user: { id: "user-1" },
    } as never);
    vi.mocked(hasPermission).mockResolvedValue(true);
    vi.mocked(listMembers).mockResolvedValue([]);

    const response = await createApiApp().request(
      "/api/organizations/org-1/members"
    );

    expect(response.status).toBe(200);
    expect(listMembers).toHaveBeenCalledWith("org-1");
  });
});
