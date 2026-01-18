"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useServer, deleteServer } from "@/hooks/useServers";
import { useVMsByServer, useServicesByServer } from "@/hooks/useRelatedEntities";
import DetailHeader from "@/components/detail/DetailHeader";
import InfoCard from "@/components/detail/InfoCard";
import ActivityLog from "@/components/detail/ActivityLog";
import RelatedEntitiesSection from "@/components/detail/RelatedEntitiesSection";
import ServerModal from "@/components/modal/ServerModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ServerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serverId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { server, isLoading, mutate } = useServer(serverId);
  const { vms, total: vmTotal, isLoading: vmsLoading } = useVMsByServer(serverId);
  const {
    services,
    total: serviceTotal,
    isLoading: servicesLoading,
  } = useServicesByServer(serverId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteServer(serverId);
      toast.success("Server deleted successfully");
      router.push("/infrastructure/servers");
    } catch {
      toast.error("Failed to delete server. It may have VMs attached.");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Loading server details...</p>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Server not found</p>
      </div>
    );
  }

  const infoItems = [
    { label: "IP Address", value: server.ip },
    { label: "Subnet", value: server.subnet?.name },
    { label: "Operating System", value: server.os?.name },
    { label: "Gateway", value: server.subnet?.gateway },
    { label: "DNS", value: server.subnet?.dns },
    { label: "Subnet Mask", value: server.subnet?.mask ? `/${server.subnet.mask}` : undefined },
    {
      label: "Created",
      value: server.createdAt
        ? format(new Date(server.createdAt), "PPp")
        : undefined,
    },
    {
      label: "Last Updated",
      value: server.updatedAt
        ? format(new Date(server.updatedAt), "PPp")
        : undefined,
    },
  ];

  const vmColumns = [
    { key: "name", label: "Name" },
    { key: "status", label: "Status" },
    { key: "vcpu", label: "vCPU" },
    {
      key: "ramGb",
      label: "RAM",
      render: (val: unknown) => `${val} GB`,
    },
    {
      key: "diskGb",
      label: "Disk",
      render: (val: unknown) => `${val} GB`,
    },
    { key: "osName", label: "OS" },
  ];

  const serviceColumns = [
    { key: "name", label: "Name" },
    {
      key: "type",
      label: "Type",
      render: (val: unknown) => (
        <StatusBadge status={String(val)} type="type" size="sm" />
      ),
    },
    { key: "status", label: "Status" },
    { key: "port", label: "Port" },
    { key: "protocol", label: "Protocol" },
    {
      key: "health",
      label: "Health",
      render: (val: unknown) => (
        <StatusBadge status={String(val)} type="health" size="sm" />
      ),
    },
  ];

  return (
    <div className="p-6">
      {isEditModalOpen && (
        <ServerModal
          server={server}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          title="Delete Server"
          message={`Are you sure you want to delete "${server.name}"? This action cannot be undone. You cannot delete a server that has VMs attached.`}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          isLoading={isDeleting}
        />
      )}

      <DetailHeader
        title={server.name}
        status={server.status}
        statusType="server"
        backLink="/infrastructure/servers"
        backLabel="Back to Servers"
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          <InfoCard title="Server Information" items={infoItems} />

          <RelatedEntitiesSection
            title="Virtual Machines"
            items={vms as unknown as Record<string, unknown>[]}
            columns={vmColumns}
            emptyMessage="No VMs are running on this server."
            isLoading={vmsLoading}
            total={vmTotal}
            nameKey="name"
            linkPrefix="/infrastructure/virtual-machines"
            statusKey="status"
            statusType="vm"
          />

          <RelatedEntitiesSection
            title="Services"
            items={services as unknown as Record<string, unknown>[]}
            columns={serviceColumns}
            emptyMessage="No services are running directly on this server."
            isLoading={servicesLoading}
            total={serviceTotal}
            nameKey="name"
            linkPrefix="/infrastructure/services"
            statusKey="status"
            statusType="service"
          />
        </div>

        {/* Sidebar - Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog entityType="SERVER" entityId={serverId} />
        </div>
      </div>
    </div>
  );
}
