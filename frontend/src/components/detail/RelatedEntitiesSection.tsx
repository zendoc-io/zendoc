"use client";

import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

type StatusType = "server" | "vm" | "service" | "health" | "type";

type Column = {
  key: string;
  label: string;
  render?: (value: unknown, item: Record<string, unknown>) => React.ReactNode;
};

type Props = {
  title: string;
  items: Record<string, unknown>[];
  columns: Column[];
  emptyMessage?: string;
  isLoading?: boolean;
  total?: number;
  nameKey?: string;
  linkPrefix?: string;
  statusKey?: string;
  statusType?: StatusType;
};

export default function RelatedEntitiesSection({
  title,
  items,
  columns,
  emptyMessage = "No items found.",
  isLoading = false,
  total,
  nameKey = "name",
  linkPrefix,
  statusKey,
  statusType = "vm",
}: Props) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-700 px-6 py-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        {total !== undefined && (
          <span className="text-sm text-gray-400">{total} total</span>
        )}
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-gray-400">Loading...</div>
      ) : items.length === 0 ? (
        <div className="p-6 text-center text-gray-400">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 text-left text-xs text-gray-400">
                {columns.map((col) => (
                  <th key={col.key} className="px-6 py-3 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr
                  key={String(item.id) || idx}
                  className="border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-6 py-3 text-sm">
                      {col.render ? (
                        col.render(item[col.key], item)
                      ) : col.key === nameKey && linkPrefix ? (
                        <Link
                          href={`${linkPrefix}/${item.id}`}
                          className="text-blue-400 hover:underline"
                        >
                          {String(item[col.key] ?? "—")}
                        </Link>
                      ) : col.key === statusKey ? (
                        <StatusBadge
                          status={String(item[col.key])}
                          type={statusType}
                          size="sm"
                        />
                      ) : (
                        String(item[col.key] ?? "—")
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
