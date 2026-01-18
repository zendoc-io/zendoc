import useSWR from "swr";
import { apiFetch } from "@/utils/api";
import { ApiResponse } from "@/types/responses";
import { useState, useCallback, useEffect } from "react";

export interface Notification {
  id: string;
  userId: string;
  type: string;
  severity: "critical" | "warning" | "info";
  title: string;
  message: string;
  isRead: boolean;
  metadata: string;
  createdAt: string;
}

export interface NotificationFilters {
  unread?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
}

export function useNotifications(filters?: NotificationFilters) {
  const params = new URLSearchParams();
  if (filters?.unread !== undefined)
    params.append("unread", filters.unread.toString());
  if (filters?.type) params.append("type", filters.type);
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const queryString = params.toString();
  const url = `/user/notifications${queryString ? `?${queryString}` : ""}`;

  const { data, error, mutate } = useSWR<ApiResponse<Notification[]>>(
    url,
    apiFetch,
  );

  return {
    notifications: data?.data || [],
    total:
      (data as unknown as ApiResponse<Notification[]> & { total?: number })
        ?.total || 0,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useUnreadCount() {
  const { data, error, mutate } = useSWR<ApiResponse<{ count: number }>>(
    "/user/notifications/unread-count",
    apiFetch,
    { refreshInterval: 30000 }, // Refresh every 30 seconds
  );

  return {
    count: data?.data?.count || 0,
    isLoading: !error && !data,
    mutate,
  };
}

export async function markAsRead(id: string) {
  return apiFetch(`/user/notifications/${id}/read`, {
    method: "POST",
    credentials: "include",
  });
}

export async function markAllAsRead() {
  return apiFetch("/user/notifications/read-all", {
    method: "POST",
    credentials: "include",
  });
}

export async function deleteNotification(id: string) {
  return apiFetch(`/user/notifications/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
}

// Paginated hook for activity feed with "load more" support
export function useNotificationsPaginated(initialLimit = 10) {
  const [page, setPage] = useState(0);
  const limit = initialLimit;

  const { notifications: fetchedNotifications, isError, mutate, isLoading } = useNotifications({
    limit,
    offset: page * limit,
  });

  const [allNotifications, setAllNotifications] = useState<Notification[]>([]);

  // Update all notifications when fetched data changes
  useEffect(() => {
    if (fetchedNotifications && fetchedNotifications.length > 0) {
      if (page === 0) {
        // First page - replace all
        setAllNotifications(fetchedNotifications);
      } else {
        // Subsequent pages - append
        setAllNotifications((prev) => [...prev, ...fetchedNotifications]);
      }
    }
  }, [fetchedNotifications, page]);

  const loadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  const reset = useCallback(() => {
    setAllNotifications([]);
    setPage(0);
    mutate();
  }, [mutate]);

  const hasMore = fetchedNotifications && fetchedNotifications.length === limit;

  return {
    notifications: allNotifications,
    loadMore,
    reset,
    hasMore: !!hasMore,
    isLoading,
    isError,
    mutate,
  };
}
