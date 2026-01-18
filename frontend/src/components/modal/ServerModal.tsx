"use client";

import { useState, useEffect } from "react";
import BaseModal from "./BaseModal";
import BaseInput from "@/components/inputs/BaseInput";
import BaseSelect from "@/components/inputs/BaseSelect";
import BaseButton from "@/components/BaseButton";
import { Server, createServer, updateServer } from "@/hooks/useServers";
import {
  useOSOptions,
  useSubnetOptions,
  SERVER_STATUS_OPTIONS,
} from "@/hooks/useFilterOptions";
import { toast } from "sonner";

type Props = {
  server?: Server;
  onClose: () => void;
  onSuccess: () => void;
};

export default function ServerModal({ server, onClose, onSuccess }: Props) {
  const isEdit = !!server;
  const { options: osOptions } = useOSOptions();
  const { options: subnetOptions } = useSubnetOptions();

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: server?.name || "",
    status: server?.status || "ACTIVE",
    ip: server?.ip || "",
    subnet_id: server?.subnet?.id || "",
    os_id: server?.os?.id || "",
  });

  useEffect(() => {
    if (server) {
      setFormData({
        name: server.name,
        status: server.status,
        ip: server.ip,
        subnet_id: server.subnet?.id || "",
        os_id: server.os?.id || "",
      });
    }
  }, [server]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isEdit) {
        await updateServer({ id: server.id, ...formData });
        toast.success("Server updated successfully!");
      } else {
        await createServer(formData);
        toast.success("Server created successfully!");
      }
      onSuccess();
      onClose();
    } catch {
      toast.error(isEdit ? "Failed to update server" : "Failed to create server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseModal title={isEdit ? "Edit Server" : "Create Server"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="w-[480px] space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold">Name</label>
          <BaseInput
            value={formData.name}
            onChange={(val) => setFormData({ ...formData, name: val })}
            placeholder="Enter server name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Status</label>
            <BaseSelect
              value={formData.status}
              onChange={(val) => setFormData({ ...formData, status: val })}
              options={SERVER_STATUS_OPTIONS.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">IP Address</label>
            <BaseInput
              value={formData.ip}
              onChange={(val) => setFormData({ ...formData, ip: val })}
              placeholder="192.168.1.100"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-semibold">Subnet</label>
            <BaseSelect
              value={formData.subnet_id}
              onChange={(val) => setFormData({ ...formData, subnet_id: val })}
              options={subnetOptions.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              placeholder="Select subnet..."
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Operating System
            </label>
            <BaseSelect
              value={formData.os_id}
              onChange={(val) => setFormData({ ...formData, os_id: val })}
              options={osOptions.map((opt) => ({
                value: opt.id,
                label: opt.name,
              }))}
              placeholder="Select OS..."
              required
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <BaseButton type="icon" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          <BaseButton buttonType="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEdit ? "Update Server" : "Create Server"}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  );
}
