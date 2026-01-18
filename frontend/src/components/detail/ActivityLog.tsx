"use client";

import { useEntityActivity, Activity } from "@/hooks/useActivity";
import { formatDistanceToNow } from "date-fns";

type Props = {
  entityType: "SERVER" | "VM" | "SERVICE";
  entityId: string;
};

const actionColors: Record<string, string> = {
  CREATED: "text-green-400",
  UPDATED: "text-blue-400",
  DELETED: "text-red-400",
  STATUS_CHANGED: "text-orange-400",
};

const actionIcons: Record<string, string> = {
  CREATED: "+",
  UPDATED: "~",
  DELETED: "-",
  STATUS_CHANGED: "*",
};

function ActivityItem({ activity }: { activity: Activity }) {
  const timeAgo = formatDistanceToNow(new Date(activity.createdAt), {
    addSuffix: true,
  });

  return (
    <div className="flex items-start gap-3 border-b border-gray-700 py-3 last:border-b-0">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-gray-700 text-xs font-bold ${actionColors[activity.action]}`}
      >
        {actionIcons[activity.action]}
      </span>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.userName || "System"}</span>{" "}
          <span className={actionColors[activity.action]}>
            {activity.action.toLowerCase().replace("_", " ")}
          </span>{" "}
          this {activity.entityType.toLowerCase()}
        </p>
        {Array.isArray(activity.changes) && activity.changes.length > 0 && (
          <div className="mt-1 text-xs text-gray-400">
            {activity.changes.map((change, idx) => (
              <span key={idx}>
                {change.field}: {String(change.oldValue ?? "")} →{" "}
                {String(change.newValue ?? "")}
                {idx < activity.changes.length - 1 && ", "}
              </span>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">{timeAgo}</p>
      </div>
    </div>
  );
}

export default function ActivityLog({ entityType, entityId }: Props) {
  const { activities, isLoading } = useEntityActivity(entityType, entityId);

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
      <h2 className="mb-4 text-lg font-semibold">Activity Log</h2>
      {isLoading ? (
        <p className="text-sm text-gray-400">Loading activity...</p>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400">No activity recorded yet.</p>
      ) : (
        <div className="max-h-80 overflow-y-auto">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
}
