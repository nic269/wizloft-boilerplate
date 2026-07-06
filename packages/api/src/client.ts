import type { RpcProcedureId, RpcProcedureOutput } from "./rpc/contract";

export interface ApiClientOptions {
  baseUrl: string;
  fetch?: typeof fetch;
}

export const createApiClient = ({ baseUrl, fetch: fetcher = fetch }: ApiClientOptions) => {
  const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetcher(new URL(path, baseUrl), {
      ...init,
      headers: {
        "content-type": "application/json",
        ...init?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
  };

  return {
    status: () => request<{ ok: boolean; service: string; time: string }>("/status"),
    organizations: () => request<{ data: { id: string; name: string; slug: string }[] }>("/api/organizations"),
    openapi: () => request<typeof import("./openapi").openApiDocument>("/openapi.json"),
    rpc: <TProcedureId extends RpcProcedureId>(procedure: TProcedureId) =>
      request<{ data: RpcProcedureOutput<TProcedureId> }>(`/rpc/${procedure}`),
  };
};
