"use client";

import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import BaseInput from "@/components/inputs/BaseInput";
import BaseSelect from "@/components/inputs/BaseSelect";
import BaseButton from "@/components/BaseButton";
import { VM, createVM, updateVM } from "@/hooks/useVMs";
import {
  useOSOptions,
  useSubnetOptions,
  useServerOptions,
  VM_STATUS_OPTIONS,
} from "@/hooks/useFilterOptions";
import { toast } from "sonner";

type Props = {
  vm?: VM;
  onClose: () => void;
  onSuccess: () => void;
};

export default function VMModal({ vm, onClose, onSuccess }: Props) {
  const isEdit = !!vm;
  const { options: osOptions } = useOSOptions();
  const { options: subnetOptions } = useSubnetOptions();
  const { options: serverOptions } = useServerOptions();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: vm?.name || "",
    status: vm?.status || "RUNNING",
    hostServerId: vm?.hostServerId || "",
    vcpu: vm?.vcpu || 1,
    ramGb: vm?.ramGb || 1,
    diskGb: vm?.diskGb || 20,
    osId: vm?.osId || "",
    ip: vm?.ip || "",
    subnetId: vm?.subnetId || "",
  });

  useEffect(() => {
    if (vm) {
      setFormData({
        name: vm.name,
        status: vm.status,
        hostServerId: vm.hostServerId,
        vcpu: vm.vcpu,
        ramGb: vm.ramGb,
        diskGb: vm.diskGb,
        osId: vm.osId,
        ip: vm.ip || "",
        subnetId: vm.subnetId || "",
      });
    }
  }, [vm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await updateVM({ id: vm.id, ...formData });
        toast.success("VM updated successfully!");
      } else {
        await createVM(formData);
        toast.success("VM created successfully!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update VM" : "Failed to create VM");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal
      title={isEdit ? "Edit Virtual Machine" : "Create Virtual Machine"}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="w-[540px] space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Name</label>
            <BaseInput
              value={formData.name}
              onChange={(val) => setFormData({ ...formData, name: val })}
              placeholder="Enter VM name"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Status</label>
            <BaseSelect
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={VM_STATUS_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Host Server</label>
          <BaseSelect
            value={formData.hostServerId}
            onChange={(val) => setFormData({ ...formData, hostServerId: val })}
            options={serverOptions.map((opt) => ({
              value: opt.id,
              label: opt.name,
            }))}
            placeholder="Select host server..."
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">vCPU</label>
            <BaseInput
              type="number"
              value={String(formData.vcpu)}
              onChange={(val) =>
                setFormData({ ...formData, vcpu: parseInt(val) || 1 })
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">RAM (GB)</label>
            <BaseInput
              type="number"
              value={String(formData.ramGb)}
              onChange={(val) =>
                setFormData({ ...formData, ramGb: parseInt(val) || 1 })
              }
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">Disk (GB)</label>
            <BaseInput
              type="number"
              value={String(formData.diskGb)}
              onChange={(val) =>
                setFormData({ ...formData, diskGb: parseInt(val) || 20 })
              }
              required
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Operating System
          </label>
          <BaseSelect
            value={formData.osId}
            onChange={(val) => setFormData({ ...formData, osId: val })}
            options={osOptions.map((opt) => ({
              value: opt.id,
              label: opt.name,
            }))}
            placeholder="Select OS..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              IP Address (optional)
            </label>
            <BaseInput
              value={formData.ip}
              onChange={(val) => setFormData({ ...formData, ip: val })}
              placeholder="192.168.1.100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Subnet (optional)
            </label>
            <BaseSelect
              value={formData.subnetId}
              onChange={(val) => setFormData({ ...formData, subnetId: val })}
              options={subnetOptions.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              placeholder="Select subnet..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <BaseButton type="icon" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          <BaseButton buttonType="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update VM" : "Create VM"}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
}
