import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";
import { VM } from "./useVMs";
import { Service } from "./useServices";

// VMs by Server
export function useVMsByServer(serverId: string, limit = 50, offset = 0) {
  const { data, error, mutate } = useSWR<
    ApiResponse<VM[]> & { total?: number }
  >(
    serverId
      ? `/device/server/${serverId}/vms?limit=${limit}&offset=${offset}`
      : null,
    apiFetch
  );

  return {
    vms: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Services by Server
export function useServicesByServer(serverId: string, limit = 50, offset = 0) {
  const { data, error, mutate } = useSWR<
    ApiResponse<Service[]> & { total?: number }
  >(
    serverId
      ? `/device/server/${serverId}/services?hostType=SERVER&limit=${limit}&offset=${offset}`
      : null,
    apiFetch
  );

  return {
    services: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

// Services by VM
export function useServicesByVM(vmId: string, limit = 50, offset = 0) {
  const { data, error, mutate } = useSWR<
    ApiResponse<Service[]> & { total?: number }
  >(
    vmId
      ? `/device/vm/${vmId}/services?hostType=VM&limit=${limit}&offset=${offset}`
      : null,
    apiFetch
  );

  return {
    services: data?.data || [],
    total: data?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
