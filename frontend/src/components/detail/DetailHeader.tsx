"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import BaseButton from "@/components/BaseButton";
import ChevronIcon from "@/../public/icons/chevron.svg";
import PencilIcon from "@/../public/icons/pencil.svg";
import TrashIcon from "@/../public/icons/trash.svg";

type StatusType = "server" | "vm" | "service" | "health" | "type";

type Props = {
  title: string;
  status: string;
  statusType?: StatusType;
  backLink: string;
  backLabel: string;
  onEdit?: () => void;
  onDelete?: () => void;
  extraBadges?: Array<{ label: string; type: StatusType }>;
};

export default function DetailHeader({
  title,
  status,
  statusType = "server",
  backLink,
  backLabel,
  onEdit,
  onDelete,
  extraBadges,
}: Props) {
  return (
    <div className="mb-6">
      {/* Breadcrumb */}
      <Link
        href={backLink}
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-white"
      >
        <ChevronIcon width={12} className="rotate-90" />
        {backLabel}
      </Link>

      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <StatusBadge status={status} type={statusType} />
          {extraBadges?.map((badge, idx) => (
            <StatusBadge key={idx} status={badge.label} type={badge.type} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <BaseButton
              icon={<PencilIcon width={14} />}
              type="icon"
              onClick={onEdit}
              className="h-9"
            >
              Edit
            </BaseButton>
          )}
          {onDelete && (
            <BaseButton
              icon={<TrashIcon width={14} />}
              type="icon"
              onClick={onDelete}
              className="h-9 text-red-400 hover:text-red-300"
            >
              Delete
            </BaseButton>
          )}
        </div>
      </div>
    </div>
  );
}
