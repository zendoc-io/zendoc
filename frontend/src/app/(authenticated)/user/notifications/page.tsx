"use client";

import BaseButton from "@/components/BaseButton";
import toast from "react-hot-toast";
import { useState } from "react";
import {
  useNotifications,
  markAllAsRead as markAllAsReadAPI,
  type Notification,
} from "@/hooks/useNotifications";

// Helper to format dates as relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  // Fetch notifications from API
  const { notifications: apiNotifications, mutate } = useNotifications({
    unread: filter === "unread" ? true : filter === "read" ? false : undefined,
  });

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadAPI();
      toast.success("All notifications marked as read");
      mutate(); // Revalidate data
    } catch {
      toast.error("Failed to mark notifications as read");
    }
  };

  const allNotifications: Notification[] = apiNotifications;

  const filteredNotifications = allNotifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read") return n.isRead;
    return true;
  });

  const unreadCount = allNotifications.filter((n) => !n.isRead).length;
  const readCount = allNotifications.filter((n) => n.isRead).length;

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      SERVER: "🖥️",
      VM: "📦",
      USER: "👤",
      SYSTEM: "⚙️",
      API: "🔑",
      SERVICE: "🔧",
    };
    return icons[type] || "📬";
  };

  const getNotificationIconBg = (type: string) => {
    const colors: Record<string, string> = {
      SERVER: "bg-red/20",
      VM: "bg-green/20",
      USER: "bg-blue-500/20",
      SYSTEM: "bg-yellow/20",
      API: "bg-primary/20",
      SERVICE: "bg-purple-500/20",
    };
    return colors[type] || "bg-gray-500/20";
  };

  return (
    <div className="mx-auto max-w-4xl p-3">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl">Notifications</h1>
        <BaseButton type="icon" onClick={handleMarkAllAsRead}>
          Mark all as read
        </BaseButton>
      </div>

      {/* Filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          className={`rounded-lg px-4 py-2 transition-colors duration-100 ${
            filter === "all"
              ? "bg-primary text-white"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setFilter("all")}
        >
          All ({allNotifications.length})
        </button>
        <button
          className={`rounded-lg px-4 py-2 transition-colors duration-100 ${
            filter === "unread"
              ? "bg-primary text-white"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setFilter("unread")}
        >
          Unread ({unreadCount})
        </button>
        <button
          className={`rounded-lg px-4 py-2 transition-colors duration-100 ${
            filter === "read"
              ? "bg-primary text-white"
              : "bg-gray-800 hover:bg-gray-700"
          }`}
          onClick={() => setFilter("read")}
        >
          Read ({readCount})
        </button>
      </div>

      {/* Notification list */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-8 text-center">
            <p className="text-gray-500">No notifications found</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                flex cursor-pointer items-start gap-4 rounded-lg
                border bg-gray-800 p-4 transition-colors duration-100
                hover:bg-gray-700
                ${
                  !notification.isRead
                    ? "border-l-4 border-l-primary border-y-gray-700 border-r-gray-700"
                    : "border-gray-700"
                }
              `}
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl ${getNotificationIconBg(notification.type)}`}
              >
                {getNotificationIcon(notification.type)}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <h3 className="font-semibold">{notification.title}</h3>
                  {!notification.isRead && (
                    <div className="ml-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                <p className="mb-2 text-sm text-gray-500">
                  {notification.message}
                </p>
                <span className="text-xs text-gray-500">
                  {formatRelativeTime(notification.createdAt)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
