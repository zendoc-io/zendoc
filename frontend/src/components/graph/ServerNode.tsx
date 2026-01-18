import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type ServerNodeData = {
  label: string;
  status?: string;
  ip?: string;
  nodeType: string;
};

function ServerNode({ data }: NodeProps<ServerNodeData>) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-500";
      case "INACTIVE":
        return "bg-gray-500";
      case "MAINTENANCE":
        return "bg-yellow-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="!bg-blue-500" />
      <div className="w-[220px] rounded-lg border-2 border-blue-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-blue-400 hover:shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">SERVER</span>
            </div>
            <div className="mb-2 truncate text-sm font-semibold text-white">
              {data.label}
            </div>
            {data.ip && (
              <div className="font-mono text-xs text-gray-400">{data.ip}</div>
            )}
          </div>
          {data.status && (
            <div
              className={`h-3 w-3 rounded-full ${getStatusColor(data.status)} mt-1 flex-shrink-0`}
              title={data.status}
            />
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-blue-500"
      />
    </div>
  );
}

export default memo(ServerNode);
