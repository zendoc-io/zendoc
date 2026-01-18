import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface ActivityChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface Activity {
  id: string;
  entityType: "SERVER" | "VM" | "SERVICE";
  entityId: string;
  entityName: string;
  action: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  changes: ActivityChange[];
  userId?: string;
  userName?: string;
  createdAt: string;
}

export interface ActivityFilters {
  entityType?: "SERVER" | "VM" | "SERVICE";
  entityId?: string;
  action?: "CREATED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  limit?: number;
  offset?: number;
}

export function useActivity(filters?: ActivityFilters) {
  const params = new URLSearchParams();
  if (filters?.entityType) params.append("entityType", filters.entityType);
  if (filters?.entityId) params.append("entityId", filters.entityId);
  if (filters?.action) params.append("action", filters.action);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const queryString = params.toString();
  const url = `/activity${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<
    ApiResponse<Activity[]> & { total?: number }
  >(url, apiFetch);

  return {
    activities: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useRecentActivity(limit = 10) {
  const { data, error, mutate } = useSWR<ApiResponse<Activity[]>>(
    `/activity/recent?limit=${limit}`,
    apiFetch
  );

  return {
    activities: data?.data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useEntityActivity(
  entityType: "SERVER" | "VM" | "SERVICE",
  entityId: string,
  limit = 20
) {
  const { data, error, mutate } = useSWR<
    ApiResponse<Activity[]> & { total?: number }
  >(
    entityId
      ? `/activity?entityType=${entityType}&entityId=${entityId}&limit=${limit}`
      : null,
    apiFetch
  );

  return {
    activities: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
