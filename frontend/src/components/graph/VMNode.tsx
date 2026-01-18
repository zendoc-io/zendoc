import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type VMNodeData = {
  label: string;
  status?: string;
  ip?: string;
  vcpu?: number;
  ram_gb?: number;
  nodeType: string;
};

function VMNode({ data }: NodeProps<VMNodeData>) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "RUNNING":
        return "bg-green-500";
      case "STOPPED":
        return "bg-gray-500";
      case "PAUSED":
        return "bg-yellow-500";
      case "ERROR":
        return "bg-red-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-purple-500"
      />
      <div className="w-[220px] rounded-lg border-2 border-purple-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-purple-400 hover:shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">VM</span>
            </div>
            <div className="mb-2 truncate text-sm font-semibold text-white">
              {data.label}
            </div>
            {data.ip && (
              <div className="mb-1 font-mono text-xs text-gray-400">
                {data.ip}
              </div>
            )}
            {(data.vcpu || data.ram_gb) && (
              <div className="text-xs text-gray-500">
                {data.vcpu && `${data.vcpu} vCPU`}
                {data.vcpu && data.ram_gb && " • "}
                {data.ram_gb && `${data.ram_gb}GB RAM`}
              </div>
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
        className="!bg-purple-500"
      />
    </div>
  );
}

export default memo(VMNode);
