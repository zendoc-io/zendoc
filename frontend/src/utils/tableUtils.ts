import { CellValue } from "@/components/Table/Table";
import { VM } from "@/hooks/useVMs";
import { Service } from "@/hooks/useServices";
import { Server } from "@/hooks/useServers";

export function vmToTableRow(vm: VM): CellValue[] {
  return [
    { text: vm.id },
    {
      text: vm.name,
      link: `/infrastructure/virtual-machines/${vm.id}`,
    },
    {
      text: vm.status,
      color: vm.status === "RUNNING" ? "green" : "orange",
    },
    {
      text: vm.hostServerName,
      link: "/infrastructure/servers",
    },
    { text: vm.vcpu },
    { text: `${vm.ramGb} GB` },
    { text: `${vm.diskGb} GB` },
    {
      text: vm.osName,
      type: "linux",
    },
    {
      text: vm.serviceCount,
      link: "/infrastructure/services",
    },
  ];
}

export function serviceToTableRow(service: Service): CellValue[] {
  const typeColors: Record<string, string> = {
    WEB_SERVER: "#FF9F0A",
    DATABASE: "#AF00FF",
    CACHE: "#00D9FF",
    API: "#FF634D",
    QUEUE: "#30D158",
    OTHER: "#A5A5A5",
  };

  const healthColors: Record<string, string> = {
    HEALTHY: "green",
    DEGRADED: "orange",
    UNHEALTHY: "red",
    UNKNOWN: "#A5A5A5",
  };

  return [
    { text: service.id },
    {
      text: service.name,
      link: `/infrastructure/services/${service.id}`,
    },
    {
      text: service.type.replace("_", " "),
      color: typeColors[service.type] || "#A5A5A5",
    },
    {
      text: service.status,
      color: service.status === "RUNNING" ? "green" : "orange",
    },
    {
      text: service.hostName,
      link:
        service.hostType === "SERVER"
          ? "/infrastructure/servers"
          : "/infrastructure/virtual-machines",
    },
    { text: service.port },
    { text: service.protocol },
    {
      text: service.health,
      color: healthColors[service.health] || "#A5A5A5",
    },
  ];
}

export function serverToTableRow(server: Server): CellValue[] {
  const statusColors: Record<string, string> = {
    ACTIVE: "green",
    RUNNING: "green",
    MAINTENANCE: "orange",
    INACTIVE: "#A5A5A5",
    PROVISIONING: "#00D9FF",
    DECOMMISSIONED: "#6B7280",
  };

  return [
    { text: server.id },
    {
      text: server.name,
      link: `/infrastructure/servers/${server.id}`,
    },
    {
      text: server.status,
      color: statusColors[server.status] || "#A5A5A5",
    },
    { text: server.ip },
    { text: server.subnet?.name || "—" },
    { text: server.os?.name || "—" },
  ];
}
