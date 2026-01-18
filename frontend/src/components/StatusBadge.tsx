type StatusType = "server" | "vm" | "service" | "health" | "type";

type Props = {
  status: string;
  type?: StatusType;
  size?: "sm" | "md";
};

const statusColors: Record<string, Record<string, string>> = {
  server: {
    ACTIVE: "bg-green-500/20 text-green-400 border-green-500/30",
    RUNNING: "bg-green-500/20 text-green-400 border-green-500/30",
    INACTIVE: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    MAINTENANCE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    PROVISIONING: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    DECOMMISSIONED: "bg-gray-600/20 text-gray-500 border-gray-600/30",
  },
  vm: {
    RUNNING: "bg-green-500/20 text-green-400 border-green-500/30",
    STOPPED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    PAUSED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    SUSPENDED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  service: {
    RUNNING: "bg-green-500/20 text-green-400 border-green-500/30",
    STOPPED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    STARTING: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    ERROR: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  health: {
    HEALTHY: "bg-green-500/20 text-green-400 border-green-500/30",
    DEGRADED: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    UNHEALTHY: "bg-red-500/20 text-red-400 border-red-500/30",
    UNKNOWN: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  },
  type: {
    WEB_SERVER: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    DATABASE: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    CACHE: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    API: "bg-red-500/20 text-red-400 border-red-500/30",
    QUEUE: "bg-green-500/20 text-green-400 border-green-500/30",
    OTHER: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    SERVER: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    VM: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  },
};

const defaultColor = "bg-gray-500/20 text-gray-400 border-gray-500/30";

export default function StatusBadge({ status, type = "server", size = "md" }: Props) {
  const colorMap = statusColors[type] || statusColors.server;
  const colorClass = colorMap[status] || defaultColor;

  const sizeClass = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  const displayText = status.replace(/_/g, " ");

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${colorClass} ${sizeClass}`}
    >
      {displayText}
    </span>
  );
}
