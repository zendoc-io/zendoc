"use client";

import Link from "next/link";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useServers } from "@/hooks/useServers";
import { useVMs } from "@/hooks/useVMs";
import { useServices } from "@/hooks/useServices";
import { useNotifications, useNotificationsPaginated, Notification } from "@/hooks/useNotifications";
import { useMemo } from "react";
import ServerIcon from "@/../public/icons/server.svg";
import VmIcon from "@/../public/icons/vm.svg";
import DockerIcon from "@/../public/icons/docker.svg";
import BellIcon from "@/../public/icons/bell.svg";
import SettingsIcon from "@/../public/icons/settings.svg";

export default function Home() {
  // Fetch real data from APIs
  const { servers, isLoading: isLoadingServers, isError: serversError } = useServers();
  const { vms, isLoading: isLoadingVMs, isError: vmsError } = useVMs();
  const { services, isLoading: isLoadingServices, isError: servicesError } = useServices();
  const { notifications, isLoading: isLoadingNotifications, isError: notificationsError } = useNotifications({ unread: true });
  const {
    notifications: activityNotifications,
    loadMore,
    hasMore,
    isLoading: isLoadingActivity,
  } = useNotificationsPaginated(10);

  console.log('Dashboard Debug:', {
    servers: { count: servers.length, data: servers, loading: isLoadingServers, error: serversError },
    vms: { count: vms.length, data: vms, loading: isLoadingVMs, error: vmsError },
    services: { count: services.length, data: services, loading: isLoadingServices, error: servicesError },
    notifications: { count: notifications.length, data: notifications, loading: isLoadingNotifications, error: notificationsError },
  });

  // Calculate VM distribution per server
  const vmDistributionData = useMemo(() => {
    const distribution: Record<string, number> = {};
    vms.forEach((vm) => {
      const serverName = vm.hostServerName || "Unknown";
      distribution[serverName] = (distribution[serverName] || 0) + 1;
    });
    return Object.entries(distribution).map(([name, count]) => ({
      name,
      vms: count,
    }));
  }, [vms]);

  // Calculate server status distribution from live data
  const serverStatusData = useMemo(() => {
    const counts: Record<string, number> = {};

    servers.forEach((server) => {
      const key = server.status?.toString() || "UNKNOWN";
      counts[key] = (counts[key] || 0) + 1;
    });

    if (Object.keys(counts).length === 0) {
      return [
        { status: "ACTIVE", count: 0 },
        { status: "INACTIVE", count: 0 },
      ];
    }

    return Object.entries(counts).map(([status, count]) => ({
      status,
      count,
    }));
  }, [servers]);

  const stats = [
    {
      label: "Servers",
      value: servers.length,
      icon: <ServerIcon width={24} />,
      href: "/infrastructure/servers",
    },
    {
      label: "Virtual Machines",
      value: vms.length,
      icon: <VmIcon width={24} />,
      href: "/infrastructure/virtual-machines",
    },
    {
      label: "Services",
      value: services.length,
      icon: <DockerIcon width={24} />,
      href: "/infrastructure/services",
    },
    {
      label: "Active Alerts",
      value: notifications.length,
      icon: <BellIcon width={24} />,
      href: "/user/notifications",
    },
  ];

  const getSeverityColors = (severity: "critical" | "warning" | "info") => {
    switch (severity) {
      case "critical":
        return "bg-red-500/20 border-red-500/30";
      case "warning":
        return "bg-yellow-500/20 border-yellow-500/30";
      case "info":
        return "bg-blue-500/20 border-blue-500/30";
      default:
        return "bg-gray-500/20 border-gray-500/30";
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

    if (diffInHours < 1) {
      const mins = Math.floor(diffInMs / (1000 * 60));
      return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    } else if (diffInDays < 7) {
      const days = Math.floor(diffInDays);
      return `${days} day${days !== 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const quickLinks = [
    {
      name: "Servers",
      href: "/infrastructure/servers",
      icon: <ServerIcon width={32} />,
      description: "Manage physical servers",
    },
    {
      name: "Virtual Machines",
      href: "/infrastructure/virtual-machines",
      icon: <VmIcon width={32} />,
      description: "Manage VMs",
    },
    {
      name: "Services",
      href: "/infrastructure/services",
      icon: <DockerIcon width={32} />,
      description: "Monitor services",
    },
    {
      name: "Settings",
      href: "/settings/users",
      icon: <SettingsIcon width={32} />,
      description: "Configure system",
    },
  ];

  return (
    <div className="p-3">
      <h1 className="mb-6 text-3xl">Welcome back, Tim Witzdam!</h1>

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <div className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-6 transition-colors duration-100 hover:border-gray-600">
              <div className="mb-2 flex items-start justify-between">
                <span className="text-gray-400">{stat.icon}</span>
                <span className="text-3xl font-bold">{stat.value}</span>
              </div>
              <p className="text-gray-500">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Server Status Distribution */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Server Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={serverStatusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="status" stroke="#A5A5A5" />
              <YAxis allowDecimals={false} stroke="#A5A5A5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #3A3A3A",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="count" fill="#30D158" name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* VM Distribution */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">VM Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vmDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3A3A3A" />
              <XAxis dataKey="name" stroke="#A5A5A5" />
              <YAxis stroke="#A5A5A5" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #3A3A3A",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="vms" fill="#FF634D" name="VMs" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Recent Activity</h2>
          <div className="max-h-80 space-y-3 overflow-y-auto">
            {isLoadingActivity && activityNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Loading activity...
              </div>
            ) : activityNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No recent activity
              </div>
            ) : (
              <>
                {activityNotifications.map((notification: Notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 transition-colors duration-100 hover:bg-gray-700 ${getSeverityColors(notification.severity)}`}
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-400">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
                {hasMore && (
                  <button
                    onClick={loadMore}
                    className="w-full rounded-lg border border-gray-700 p-2 text-sm text-gray-400 transition-colors duration-100 hover:bg-gray-700"
                  >
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="mb-4 text-xl">Quick Links</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link key={link.name} href={link.href}>
                <div className="cursor-pointer rounded-lg border border-gray-700 bg-gray-800 p-4 text-center transition-colors duration-100 hover:bg-gray-700">
                  <span className="mb-2 flex justify-center text-gray-400">{link.icon}</span>
                  <p className="mb-1 font-semibold">{link.name}</p>
                  <p className="text-xs text-gray-500">{link.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
