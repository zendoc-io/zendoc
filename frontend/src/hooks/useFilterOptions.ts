import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface FilterOption {
  id: string;
  name: string;
}

// Static enum options
export const SERVER_STATUS_OPTIONS: FilterOption[] = [
  { id: "ACTIVE", name: "Active" },
  { id: "INACTIVE", name: "Inactive" },
  { id: "MAINTENANCE", name: "Maintenance" },
  { id: "PROVISIONING", name: "Provisioning" },
  { id: "DECOMMISSIONED", name: "Decommissioned" },
];

export const VM_STATUS_OPTIONS: FilterOption[] = [
  { id: "RUNNING", name: "Running" },
  { id: "STOPPED", name: "Stopped" },
  { id: "PAUSED", name: "Paused" },
  { id: "SUSPENDED", name: "Suspended" },
  { id: "ERROR", name: "Error" },
];

export const SERVICE_STATUS_OPTIONS: FilterOption[] = [
  { id: "RUNNING", name: "Running" },
  { id: "STOPPED", name: "Stopped" },
  { id: "STARTING", name: "Starting" },
  { id: "ERROR", name: "Error" },
];

export const SERVICE_TYPE_OPTIONS: FilterOption[] = [
  { id: "WEB_SERVER", name: "Web Server" },
  { id: "DATABASE", name: "Database" },
  { id: "CACHE", name: "Cache" },
  { id: "API", name: "API" },
  { id: "QUEUE", name: "Queue" },
  { id: "OTHER", name: "Other" },
];

export const SERVICE_HEALTH_OPTIONS: FilterOption[] = [
  { id: "HEALTHY", name: "Healthy" },
  { id: "DEGRADED", name: "Degraded" },
  { id: "UNHEALTHY", name: "Unhealthy" },
  { id: "UNKNOWN", name: "Unknown" },
];

export const HOST_TYPE_OPTIONS: FilterOption[] = [
  { id: "SERVER", name: "Server" },
  { id: "VM", name: "Virtual Machine" },
];

// Dynamic options from API
export function useOSOptions() {
  const { data, error } = useSWR<ApiResponse<FilterOption[]>>(
    "/device/os",
    apiFetch
  );

  return {
    options: data?.data || [],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useSubnetOptions() {
  const { data, error } = useSWR<ApiResponse<FilterOption[]>>(
    "/device/subnet",
    apiFetch
  );

  return {
    options: data?.data || [],
    isLoading: !error && !data,
    isError: error,
  };
}

export function useServerOptions() {
  const { data, error } = useSWR<ApiResponse<FilterOption[]>>(
    "/device/server/options",
    apiFetch
  );

  return {
    options: data?.data || [],
    isLoading: !error && !data,
    isError: error,
  };
}
