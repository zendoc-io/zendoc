"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useService, deleteService } from "@/hooks/useServices";
import DetailHeader from "@/components/detail/DetailHeader";
import InfoCard from "@/components/detail/InfoCard";
import ActivityLog from "@/components/detail/ActivityLog";
import ServiceModal from "@/components/modal/ServiceModal";
import DeleteConfirmModal from "@/components/modal/DeleteConfirmModal";
import StatusBadge from "@/components/StatusBadge";
import { toast } from "sonner";
import { format } from "date-fns";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { service, isLoading, mutate } = useService(serviceId);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteService(serviceId);
      toast.success("Service deleted successfully");
      router.push("/infrastructure/services");
    } catch {
      toast.error("Failed to delete service");
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Loading service details...</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-gray-400">Service not found</p>
      </div>
    );
  }

  const configItems = [
    { label: "Port", value: service.port },
    { label: "Protocol", value: service.protocol },
  ];

  const metaItems = [
    {
      label: "Created",
      value: service.createdAt
        ? format(new Date(service.createdAt), "PPp")
        : undefined,
    },
    {
      label: "Last Updated",
      value: service.updatedAt
        ? format(new Date(service.updatedAt), "PPp")
        : undefined,
    },
  ];

  const hostLink =
    service.hostType === "SERVER"
      ? `/infrastructure/servers/${service.hostId}`
      : `/infrastructure/virtual-machines/${service.hostId}`;

  const hostTypeLabel =
    service.hostType === "SERVER" ? "Server" : "Virtual Machine";

  return (
    <div className="p-6">
      {isEditModalOpen && (
        <ServiceModal
          service={service}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={() => mutate()}
        />
      )}
      {isDeleteModalOpen && (
        <DeleteConfirmModal
          title="Delete Service"
          message={`Are you sure you want to delete "${service.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          isLoading={isDeleting}
        />
      )}

      <DetailHeader
        title={service.name}
        status={service.status}
        statusType="service"
        backLink="/infrastructure/services"
        backLabel="Back to Services"
        onEdit={() => setIsEditModalOpen(true)}
        onDelete={() => setIsDeleteModalOpen(true)}
        extraBadges={[
          { label: service.type, type: "type" },
          { label: service.health, type: "health" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="space-y-6 lg:col-span-2">
          {/* Host Card */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold">Host {hostTypeLabel}</h2>
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                  service.hostType === "SERVER"
                    ? "bg-blue-500/20"
                    : "bg-violet-500/20"
                }`}
              >
                {service.hostType === "SERVER" ? (
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
                ) : (
                  <svg
                    className="h-6 w-6 text-violet-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
                    />
                  </svg>
                )}
              </div>
              <div>
                <Link
                  href={hostLink}
                  className="text-lg font-medium text-blue-400 hover:underline"
                >
                  {service.hostName}
                </Link>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <StatusBadge
                    status={service.hostType}
                    type="type"
                    size="sm"
                  />
                  <span>This service runs on this {hostTypeLabel.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Overview */}
          <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
            <h2 className="mb-4 text-lg font-semibold">Status Overview</h2>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="mb-2 text-xs text-gray-400">Service Status</p>
                <StatusBadge status={service.status} type="service" />
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-400">Health</p>
                <StatusBadge status={service.health} type="health" />
              </div>
              <div>
                <p className="mb-2 text-xs text-gray-400">Type</p>
                <StatusBadge status={service.type} type="type" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <InfoCard title="Configuration" items={configItems} />
            <InfoCard title="Metadata" items={metaItems} />
          </div>
        </div>

        {/* Sidebar - Activity Log */}
        <div className="lg:col-span-1">
          <ActivityLog entityType="SERVICE" entityId={serviceId} />
        </div>
      </div>
    </div>
  );
}
