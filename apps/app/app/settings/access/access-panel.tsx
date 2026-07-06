"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

interface Organization {
  id: string;
  name: string;
}
interface Permission {
  action: string;
  module: string;
}
interface Role {
  _count: { memberships: number };
  description: string | null;
  id: string;
  name: string;
  permissions: Permission[];
}
interface Member {
  id: string;
  role: { id: string; name: string } | null;
  status: string;
  user: { id: string; name: string; email: string };
}
interface AuditLog {
  action: string;
  actor: { name: string; email: string } | null;
  createdAt: string;
  id: string;
  metadata: unknown;
  targetId: string | null;
  targetType: string | null;
}
interface ApiPayload<T> {
  data?: T;
  error?: { message?: string };
}

const permissionOptions = [
  { action: "read", label: "Read organization", module: "organization" },
  { action: "update", label: "Update organization", module: "organization" },
  { action: "read", label: "Read members", module: "members" },
  { action: "invite", label: "Invite members", module: "members" },
  { action: "manage", label: "Manage members", module: "members" },
  { action: "read", label: "Read roles", module: "roles" },
  { action: "manage", label: "Manage roles", module: "roles" },
  { action: "read", label: "Read audit log", module: "audit" },
] as const;

const readPayload = async <T,>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiPayload<T>;
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error?.message ?? "Request failed.");
  }
  return payload.data;
};

const permissionKey = (permission: Permission) => `${permission.module}:${permission.action}`;

export function AccessPanel() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(["organization:read", "members:read"]);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const loadAccess = useCallback(async (selectedOrganizationId: string) => {
    if (!selectedOrganizationId) {
      return;
    }
    const [nextRoles, nextMembers, nextAuditLogs] = await Promise.all([
      fetch(`/api/organizations/${selectedOrganizationId}/roles`, { credentials: "include" }).then((response) =>
        readPayload<Role[]>(response),
      ),
      fetch(`/api/organizations/${selectedOrganizationId}/members`, { credentials: "include" }).then((response) =>
        readPayload<Member[]>(response),
      ),
      fetch(`/api/organizations/${selectedOrganizationId}/audit-logs`, { credentials: "include" }).then((response) =>
        readPayload<AuditLog[]>(response),
      ),
    ]);
    setRoles(nextRoles);
    setMembers(nextMembers);
    setAuditLogs(nextAuditLogs);
  }, []);

  useEffect(() => {
    fetch("/api/organizations", { credentials: "include" })
      .then((response) => readPayload<Organization[]>(response))
      .then((data) => {
        setOrganizations(data);
        const first = data[0]?.id ?? "";
        setOrganizationId(first);
        return loadAccess(first);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load access settings."));
  }, [loadAccess]);

  const permissions = useMemo(
    () =>
      permissionOptions
        .filter((permission) => selectedPermissions.includes(permissionKey(permission)))
        .map(({ module, action }) => ({ action, module })),
    [selectedPermissions],
  );

  const createRole = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsBusy(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/roles`, {
        body: JSON.stringify({ name: roleName, permissions }),
        credentials: "include",
        headers: { "content-type": "application/json" },
        method: "POST",
      });
      await readPayload<Role>(response);
      setRoleName("");
      await loadAccess(organizationId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create role.");
    } finally {
      setIsBusy(false);
    }
  };

  const updateMemberRole = async (membershipId: string, roleId: string) => {
    setError(null);
    const response = await fetch(`/api/organizations/${organizationId}/members/${membershipId}/role`, {
      body: JSON.stringify({ roleId }),
      credentials: "include",
      headers: { "content-type": "application/json" },
      method: "PATCH",
    });
    if (!response.ok) {
      const payload = (await response.json()) as ApiPayload<never>;
      setError(payload.error?.message ?? "Could not update member role.");
      return;
    }
    await loadAccess(organizationId);
  };

  const togglePermission = (key: string) => {
    setSelectedPermissions((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key],
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Organization</CardTitle>
          <CardDescription>Select the workspace access policy to inspect.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            aria-label="Organization"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            onChange={(event) => {
              setOrganizationId(event.target.value);
              loadAccess(event.target.value);
            }}
            value={organizationId}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>Assign active members to organization-scoped roles.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y rounded-md border">
              {members.map((member) => (
                <li
                  className="flex flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  key={member.id}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-sm">{member.user.name}</p>
                    <p className="truncate text-muted-foreground text-xs">{member.user.email}</p>
                  </div>
                  <select
                    aria-label={`Role for ${member.user.email}`}
                    className="h-9 rounded-md border bg-background px-2 text-sm"
                    onChange={(event) => {
                      updateMemberRole(member.id, event.target.value);
                    }}
                    value={member.role?.id ?? ""}
                  >
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles</CardTitle>
            <CardDescription>Create reusable permission sets for this organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="divide-y rounded-md border">
              {roles.map((role) => (
                <li className="space-y-1 px-3 py-3" key={role.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-sm">{role.name}</p>
                    <span className="text-muted-foreground text-xs">{role._count.memberships} members</span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {role.permissions.map(permissionKey).join(", ") || "No permissions"}
                  </p>
                </li>
              ))}
            </ul>
            <form className="space-y-3" onSubmit={createRole}>
              <Input
                maxLength={40}
                minLength={2}
                onChange={(event) => setRoleName(event.target.value)}
                placeholder="Role name"
                required
                value={roleName}
              />
              <div className="grid gap-2 sm:grid-cols-2">
                {permissionOptions.map((permission) => {
                  const key = permissionKey(permission);
                  return (
                    <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm" key={key}>
                      <input
                        checked={selectedPermissions.includes(key)}
                        onChange={() => togglePermission(key)}
                        type="checkbox"
                      />
                      <span>{permission.label}</span>
                    </label>
                  );
                })}
              </div>
              <Button disabled={isBusy || !organizationId} type="submit">
                {isBusy ? "Creating..." : "Create role"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>Latest organization security and access events.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-md border">
            {auditLogs.map((log) => (
              <li className="grid gap-1 px-3 py-3 sm:grid-cols-[1fr_auto]" key={log.id}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{log.action}</p>
                  <p className="truncate text-muted-foreground text-xs">
                    {log.actor?.email ?? "System"} {log.targetType ? `on ${log.targetType}` : ""}
                  </p>
                </div>
                <time className="text-muted-foreground text-xs" dateTime={log.createdAt}>
                  {new Date(log.createdAt).toLocaleString()}
                </time>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
