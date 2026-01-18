import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface Service {
  id: string;
  name: string;
  type: string;
  status: string;
  hostType: string;
  hostId: string;
  hostName: string;
  port: number;
  protocol: string;
  health: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFilters {
  name?: string;
  type?: string;
  status?: string;
  hostType?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}

export function useServices(filters?: ServiceFilters) {
  const params = new URLSearchParams();
  if (filters?.name) params.append("name", filters.name);
  if (filters?.type) params.append("type", filters.type);
  if (filters?.status) params.append("status", filters.status);
  if (filters?.hostType) params.append("hostType", filters.hostType);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());
  if (filters?.sortBy) params.append("sortBy", filters.sortBy);
  if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);

  const queryString = params.toString();
  const url = `/device/service${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<ApiResponse<Service[]>>(
    url,
    apiFetch,
  );

  return {
    services: data?.data || [],
    total:
      (data as unknown as ApiResponse<Service[]> & { total?: number })?.total ||
      0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useService(id: string) {
  const { data, error, mutate } = useSWR<ApiResponse<Service>>(
    id ? `/device/service/${id}` : null,
    apiFetch,
  );

  return {
    service: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export async function createService(serviceData: {
  name: string;
  type: string;
  status: string;
  hostType: string;
  hostId: string;
  port: number;
  protocol: string;
  health: string;
}) {
  return apiFetch("/device/service", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(serviceData),
  });
}

export async function updateService(serviceData: {
  id: string;
  name: string;
  type: string;
  status: string;
  hostType: string;
  hostId: string;
  port: number;
  protocol: string;
  health: string;
}) {
  return apiFetch("/device/service", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(serviceData),
  });
}

export async function deleteService(id: string) {
  return apiFetch(`/device/service/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}
