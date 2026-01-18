"use client";

import BaseModal from "./BaseModal";
import BaseButton from "@/components/BaseButton";

type Props = {
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
  confirmLabel?: string;
};

export default function DeleteConfirmModal({
  title,
  message,
  onConfirm,
  onClose,
  isLoading = false,
  confirmLabel = "Delete",
}: Props) {
  return (
    <BaseModal title={title} onClose={onClose}>
      <div className="w-96 space-y-6">
        <p className="text-gray-300">{message}</p>

        <div className="flex justify-end gap-3">
          <BaseButton type="icon" onClick={onClose} disabled={isLoading}>
            Cancel
          </BaseButton>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
