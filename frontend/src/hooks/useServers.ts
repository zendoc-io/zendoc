import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface Server {
  id: string;
  name: string;
  status: string;
  ip: string;
  subnet?: {
    id: string;
    name: string;
    mask?: number;
    gateway?: string;
    dns?: string;
  };
  os?: {
    id: string;
    name: string;
    description?: string;
    icon?: {
      id: string;
      url: string;
    };
  };
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface ServerFilters {
  name?: string;
  status?: string;
  ip?: string;
  subnet?: string;
  os?: string;
  limit?: number;
  offset?: number;
}

export function useServers(filters?: ServerFilters) {
  const params = new URLSearchParams();
  if (filters?.name) params.append("name", filters.name);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.ip) params.append("ip", filters.ip);
  if (filters?.subnet) params.append("subnet", filters.subnet);
  if (filters?.os) params.append("os", filters.os);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const queryString = params.toString();
  const url = `/device/server${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<ApiResponse<Server[]>>(url, apiFetch);

  return {
    servers: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useServer(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<Server>>(
    id ? `/device/server/${id}` : null,
    apiFetch
  );

  return {
    server: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createServer(serverData: {
  name: string;
  status: string;
  ip: string;
  subnet_id: string;
  os_id: string;
}) {
  return apiFetch("/device/server/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(serverData),
  });
}

export async function updateServer(serverData: {
  id: string;
  name: string;
  status: string;
  ip: string;
  subnet_id: string;
  os_id: string;
}) {
  return apiFetch("/device/server", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(serverData),
  });
}

export async function deleteServer(id: string) {
  return apiFetch(`/device/server/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
