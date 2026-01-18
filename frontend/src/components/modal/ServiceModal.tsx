"use client";

import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import BaseInput from "@/components/inputs/BaseInput";
import BaseSelect from "@/components/inputs/BaseSelect";
import BaseButton from "@/components/BaseButton";
import { Service, createService, updateService } from "@/hooks/useServices";
import { useVMs } from "@/hooks/useVMs";
import {
  useServerOptions,
  SERVICE_STATUS_OPTIONS,
  SERVICE_TYPE_OPTIONS,
  SERVICE_HEALTH_OPTIONS,
  HOST_TYPE_OPTIONS,
} from "@/hooks/useFilterOptions";
import { toast } from "sonner";

type Props = {
  service?: Service;
  onClose: () => void;
  onSuccess: () => void;
  defaultHostType?: string;
  defaultHostId?: string;
};

export default function ServiceModal({
  service,
  onClose,
  onSuccess,
  defaultHostType,
  defaultHostId,
}: Props) {
  const isEdit = !!service;
  const { options: serverOptions } = useServerOptions();
  const { vms } = useVMs();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: service?.name || "",
    type: service?.type || "WEB_SERVER",
    status: service?.status || "RUNNING",
    hostType: service?.hostType || defaultHostType || "SERVER",
    hostId: service?.hostId || defaultHostId || "",
    port: service?.port || 80,
    protocol: service?.protocol || "TCP",
    health: service?.health || "UNKNOWN",
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        type: service.type,
        status: service.status,
        hostType: service.hostType,
        hostId: service.hostId,
        port: service.port,
        protocol: service.protocol,
        health: service.health,
      });
    }
  }, [service]);

  const hostOptions =
    formData.hostType === "SERVER"
      ? serverOptions.map((opt) => ({ value: opt.id, label: opt.name }))
      : vms.map((vm) => ({ value: vm.id, label: vm.name }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await updateService({ id: service.id, ...formData });
        toast.success("Service updated successfully!");
      } else {
        await createService(formData);
        toast.success("Service created successfully!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(
        isEdit ? "Failed to update service" : "Failed to create service",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      title={isEdit ? "Edit Service" : "Create Service"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="w-[540px] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Name</label>
            <BaseInput
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              placeholder="Enter service name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Type</label>
            <BaseSelect
              value={formData.type}
              onChange={(val) => setFormData({ ...formData, type: val })}
              options={SERVICE_TYPE_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Status</label>
            <BaseSelect
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={SERVICE_STATUS_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Health</label>
            <BaseSelect
              value={formData.health}
              onChange={(val) => setFormData({ ...formData, health: val })}
              options={SERVICE_HEALTH_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Host Type
            </label>
            <BaseSelect
              value={formData.hostType}
              onChange={(val) =>
                setFormData({ ...formData, hostType: val, hostId: "" })
              }
              options={HOST_TYPE_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Host</label>
            <BaseSelect
              value={formData.hostId}
              onChange={(val) => setFormData({ ...formData, hostId: val })}
              options={hostOptions}
              placeholder={`Select ${formData.hostType === "SERVER" ? "server" : "VM"}...`}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Port</label>
            <BaseInput
              type="number"
              value={String(formData.port)}
              onChange={(val) =>
                setFormData({ ...formData, port: parseInt(val) || 80 })
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Protocol</label>
            <BaseSelect
              value={formData.protocol}
              onChange={(val) => setFormData({ ...formData, protocol: val })}
              options={[
                { value: "TCP", label: "TCP" },
                { value: "UDP", label: "UDP" },
                { value: "HTTP", label: "HTTP" },
                { value: "HTTPS", label: "HTTPS" },
              ]}
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <BaseButton type="icon" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          <BaseButton buttonType="submit" disabled={isLoading}>
            {isLoading
              ? "Saving..."
              : isEdit
                ? "Update Service"
                : "Create Service"}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
}
