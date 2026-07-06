"use client";

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from "@repo/design-system";
import { type FormEvent, useCallback, useEffect, useState } from "react";

interface Organization {
  id: string;
  name: string;
  role: string | null;
  slug: string;
}

interface ApiResponse {
  data?: Organization[];
  error?: { message?: string };
}

export function OrganizationsPanel() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOrganizations = useCallback(async () => {
    const response = await fetch("/api/organizations", { credentials: "include" });
    const payload = (await response.json()) as ApiResponse;
    if (!response.ok) {
      throw new Error(payload.error?.message ?? "Could not load organizations.");
    }
    setOrganizations(payload.data ?? []);
  }, []);

  useEffect(() => {
    loadOrganizations()
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load organizations."))
      .finally(() => setIsLoading(false));
  }, [loadOrganizations]);

  const createOrganization = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload = (await response.json()) as { error?: { message?: string } };
      if (!response.ok) {
        throw new Error(payload.error?.message ?? "Could not create organization.");
      }
      setName("");
      await loadOrganizations();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create organization.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>Your active workspaces and assigned roles.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? <p className="text-muted-foreground text-sm">Loading...</p> : null}
        {!isLoading && organizations.length === 0 ? (
          <p className="text-muted-foreground text-sm">Create your first organization to get started.</p>
        ) : null}
        {organizations.length > 0 ? (
          <ul className="divide-y rounded-md border">
            {organizations.map((organization) => (
              <li className="flex items-center justify-between gap-3 px-3 py-2" key={organization.id}>
                <div className="min-w-0">
                  <p className="truncate font-medium text-sm">{organization.name}</p>
                  <p className="truncate text-muted-foreground text-xs">{organization.slug}</p>
                </div>
                <span className="text-muted-foreground text-xs">{organization.role ?? "Member"}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <form className="flex flex-col gap-2 sm:flex-row" onSubmit={createOrganization}>
          <Input
            aria-label="Organization name"
            maxLength={80}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            placeholder="Organization name"
            required
            value={name}
          />
          <Button disabled={isSubmitting} type="submit">
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </form>
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
      </CardContent>
    </Card>
  );
}
