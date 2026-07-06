"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";
import { type FormEvent, useCallback, useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
}
interface Invitation {
  email: string;
  expiresAt: string;
  id: string;
  status: string;
}
interface ApiPayload<T> {
  data?: T;
  error?: { message?: string };
}

const readPayload = async <T,>(response: Response): Promise<T> => {
  const payload = (await response.json()) as ApiPayload<T>;
  if (!response.ok || payload.data === undefined) {
    throw new Error(payload.error?.message ?? "Request failed.");
  }
  return payload.data;
};

export function MembersPanel() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [organizationId, setOrganizationId] = useState("");
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [email, setEmail] = useState("");
  const [acceptUrl, setAcceptUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const loadInvitations = useCallback(async (selectedOrganizationId: string) => {
    if (!selectedOrganizationId) {
      return;
    }
    const response = await fetch(`/api/organizations/${selectedOrganizationId}/invitations`);
    setInvitations(await readPayload<Invitation[]>(response));
  }, []);

  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => readPayload<Organization[]>(response))
      .then((data) => {
        setOrganizations(data);
        const first = data[0]?.id ?? "";
        setOrganizationId(first);
        return loadInvitations(first);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load members."));
  }, [loadInvitations]);

  const invite = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setAcceptUrl(null);
    setIsBusy(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invitations`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const created = await readPayload<{ acceptUrl: string }>(response);
      setAcceptUrl(created.acceptUrl);
      setEmail("");
      await loadInvitations(organizationId);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not send invitation.");
    } finally {
      setIsBusy(false);
    }
  };

  const revoke = async (invitationId: string) => {
    setError(null);
    const response = await fetch(`/api/organizations/${organizationId}/invitations/${invitationId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const payload = (await response.json()) as ApiPayload<never>;
      setError(payload.error?.message ?? "Could not revoke invitation.");
      return;
    }
    await loadInvitations(organizationId);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Invite member</CardTitle>
          <CardDescription>Invitations expire after seven days and grant the Member role.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <select
            aria-label="Organization"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            onChange={(event) => {
              setOrganizationId(event.target.value);
              loadInvitations(event.target.value);
            }}
            value={organizationId}
          >
            {organizations.map((organization) => (
              <option key={organization.id} value={organization.id}>
                {organization.name}
              </option>
            ))}
          </select>
          <form className="flex flex-col gap-2 sm:flex-row" onSubmit={invite}>
            <Input
              onChange={(event) => setEmail(event.target.value)}
              placeholder="member@example.com"
              required
              type="email"
              value={email}
            />
            <Button disabled={isBusy || !organizationId} type="submit">
              {isBusy ? "Sending..." : "Send invite"}
            </Button>
          </form>
          {acceptUrl ? (
            <a className="block break-all font-medium text-primary text-sm hover:underline" href={acceptUrl}>
              {acceptUrl}
            </a>
          ) : null}
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invitations</CardTitle>
          <CardDescription>Pending and historical invitations for this organization.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y rounded-md border">
            {invitations.map((invitation) => (
              <li className="flex items-center justify-between gap-3 px-3 py-3" key={invitation.id}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{invitation.email}</p>
                  <p className="text-muted-foreground text-xs">{invitation.status.toLowerCase()}</p>
                </div>
                {invitation.status === "PENDING" ? (
                  <Button
                    onClick={() => {
                      revoke(invitation.id);
                    }}
                    size="sm"
                    variant="destructive"
                  >
                    Revoke
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
