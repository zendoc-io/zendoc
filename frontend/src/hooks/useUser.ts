import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  userType: string;
  mfaEnabled?: string;
  lastLogin?: string;
  emailVerified: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export function useUser() {
  const { data, error, mutate } = useSWR<ApiResponse<User>>(
    "/auth/me",
    apiFetch,
  );

  return {
    user: data?.data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
