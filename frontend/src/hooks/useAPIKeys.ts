import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface APIKey {
  id: string;
  name: string;
  maskedKey: string;
  permissions: string;
  lastUsedAt?: string;
  expiresAt?: string;
  createdAt: string;
}

export function useAPIKeys() {
  const { data, error, mutate } = useSWR<ApiResponse<APIKey[]>>(
    "/user/api-keys",
    apiFetch,
  );

  return {
    apiKeys: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createAPIKey(keyData: {
  name: string;
  permissions: string[];
  expiresInDays?: number;
}) {
  return apiFetch<ApiResponse<{ key: string }>>("/user/api-keys", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(keyData),
  });
}

export async function revokeAPIKey(id: string) {
  return apiFetch(`/user/api-keys/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
