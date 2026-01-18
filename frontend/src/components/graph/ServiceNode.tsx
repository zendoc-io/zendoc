import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type ServiceNodeData = {
  label: string;
  status?: string;
  port?: number;
  protocol?: string;
  health?: string;
  type?: string;
  nodeType: string;
};

function ServiceNode({ data }: NodeProps<ServiceNodeData>) {
  const getHealthColor = (health?: string) => {
    switch (health) {
      case "HEALTHY":
        return "bg-green-500";
      case "DEGRADED":
        return "bg-yellow-500";
      case "UNHEALTHY":
        return "bg-red-500";
      case "UNKNOWN":
        return "bg-gray-500";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="!bg-green-500" />
      <div className="w-[220px] rounded-lg border-2 border-green-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-green-400 hover:shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">SERVICE</span>
            </div>
            <div className="mb-2 truncate text-sm font-semibold text-white">
              {data.label}
            </div>
            {(data.port || data.protocol) && (
              <div className="mb-1 font-mono text-xs text-gray-400">
                {data.protocol && `${data.protocol}`}
                {data.protocol && data.port && ":"}
                {data.port && `${data.port}`}
              </div>
            )}
            {data.type && (
              <div className="text-xs text-gray-500">{data.type}</div>
            )}
          </div>
          {data.health && (
            <div
              className={`h-3 w-3 rounded-full ${getHealthColor(data.health)} mt-1 flex-shrink-0`}
              title={data.health}
            />
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-green-500"
      />
    </div>
  );
}

export default memo(ServiceNode);
