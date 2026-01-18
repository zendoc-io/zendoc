"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useVM, deleteVM } from "@/hooks/useVMs";
import { useServicesByVM } from "@/hooks/useRelatedEntities";
import DetailHeader from "@/components/detail/DetailHeader";
import InfoCard from "@/components/detail/InfoCard";
import ActivityLog from "@/components/detail/ActivityLog";
import RelatedEntitiesSection from "@/components/detail/RelatedEntitiesSection";
import VMModal from "@/components/modal/VMModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { format } from "date-fns";

export default function VMDetailPage() {
  const params = useParams();
  const router = useRouter();
  const vmId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { vm, isLoading, mutate } = useVM(vmId);
  const {
    services,
    total: serviceTotal,
    isLoading: servicesLoading,
  } = useServicesByVM(vmId);

  const safeServices = Array.isArray(services) ? services : [];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteVM(vmId);
      toast.success("VM deleted successfully");
      router.push("/infrastructure/virtual-machines");
    } catch {
      toast.error("Failed to delete VM");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Loading VM details...</p>
      </div>
    );
  }

  if (!vm) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Virtual Machine not found</p>
      </div>
    );
  }

  const resourceItems = [
    { label: "vCPU", value: String(vm.vcpu) },
    { label: "RAM", value: `${vm.ramGb} GB` },
    { label: "Disk", value: `${vm.diskGb} GB` },
    { label: "Operating System", value: vm.osName },
  ];

  const networkItems = [
    { label: "IP Address", value: vm.ip || "Not assigned" },
    { label: "Subnet", value: vm.subnetName || "Not assigned" },
  ];

  const metaItems = [
    {
      label: "Created",
      value: vm.createdAt ? format(new Date(vm.createdAt), "PPp") : "—",
    },
    {
      label: "Last Updated",
      value: vm.updatedAt ? format(new Date(vm.updatedAt), "PPp") : "—",
    },
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
    {
      key: "status",
      label: "Status",
      render: (val: unknown) => (
        <StatusBadge status={String(val)} type="service" size="sm" />
      ),
    },
    {
      key: "port",
      label: "Port",
      render: (val: unknown) => <>{typeof val === 'number' ? val : "—"}</>,
    },
    {
      key: "protocol",
      label: "Protocol",
      render: (val: unknown) => <>{typeof val === 'string' ? val : "—"}</>,
    },
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
        <VMModal
          vm={vm}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          title="Delete Virtual Machine"
          message={`Are you sure you want to delete "${vm.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          isLoading={isDeleting}
        />
      )}

      <DetailHeader
        title={vm.name}
        status={vm.status}
        statusType="vm"
        backLink="/infrastructure/virtual-machines"
        backLabel="Back to Virtual Machines"
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Host Server Card */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold">Host Server</h2>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20">
                <svg
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 14.25h13.5m-13.5 0a3 3 0 0 1-3-3m3 3a3 3 0 1 0 0 6h13.5a3 3 0 1 0 0-6m-16.5-3a3 3 0 0 1 3-3h13.5a3 3 0 0 1 3 3m-19.5 0a4.5 4.5 0 0 1 .9-2.7L5.737 5.1a3.375 3.375 0 0 1 2.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 0 1 .9 2.7m0 0a3 3 0 0 1-3 3m0 3h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Zm-3 6h.008v.008h-.008v-.008Zm0-6h.008v.008h-.008v-.008Z"
                  />
                </svg>
              </div>
              <div>
                <Link
                  href={`/infrastructure/servers/${vm.hostServerId}`}
                  className="text-lg font-medium text-blue-400 hover:underline"
                >
                  {vm.hostServerName}
                </Link>
                <p className="text-sm text-gray-400">
                  This VM is hosted on this server
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard title="Resources" items={resourceItems} />
            <InfoCard title="Network" items={networkItems} />
          </div>

          <InfoCard title="Metadata" items={metaItems} />

      <RelatedEntitiesSection
        title="Services"
        items={safeServices as unknown as Record<string, unknown>[]}
        columns={serviceColumns}
        emptyMessage="No services are running on this VM."
        isLoading={servicesLoading}
        total={serviceTotal}
        nameKey="name"
        linkPrefix="/infrastructure/services"
      />

        </div>

        {/* Sidebar - Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog entityType="VM" entityId={vmId} />
        </div>
      </div>
    </div>
  );
}
