import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface VM {
  id: string;
  name: string;
  status: string;
  hostServerId: string;
  hostServerName: string;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  osId: string;
  osName: string;
  ip?: string;
  subnetId?: string;
  subnetName?: string;
  serviceCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface VMFilters {
  name?: string;
  status?: string;
  hostId?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

export function useVMs(filters?: VMFilters) {
  const params = new URLSearchParams();
  if (filters?.name) params.append("name", filters.name);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.hostId) params.append("hostId", filters.hostId);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const queryString = params.toString();
  const url = `/device/vm${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<ApiResponse<VM[]>>(url, apiFetch);

  return {
    vms: data?.data || [],
    total:
      (data as unknown as ApiResponse<VM[]> & { total?: number })?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useVM(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<VM>>(
    id ? `/device/vm/${id}` : null,
    apiFetch,
  );

  return {
    vm: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createVM(vmData: {
  name: string;
  status: string;
  hostServerId: string;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  osId: string;
  ip?: string;
  subnetId?: string;
}) {
  return apiFetch("/device/vm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(vmData),
  });
}

export async function updateVM(vmData: {
  id: string;
  name: string;
  status: string;
  hostServerId: string;
  vcpu: number;
  ramGb: number;
  diskGb: number;
  osId: string;
  ip?: string;
  subnetId?: string;
}) {
  return apiFetch("/device/vm", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(vmData),
  });
}

export async function deleteVM(id: string) {
  return apiFetch(`/device/vm/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
