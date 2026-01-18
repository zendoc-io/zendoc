import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type OSNodeData = {
  label: string;
  nodeType: string;
};

function OSNode({ data }: NodeProps<OSNodeData>) {
  return (
    <div className="group relative">
      <Handle type="target" position={Position.Top} className="!bg-gray-500" />
      <div className="w-[220px] rounded-lg border-2 border-gray-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-gray-400 hover:shadow-xl">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">OS</span>
            </div>
            <div className="truncate text-sm font-semibold text-white">
              {data.label}
            </div>
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-gray-500"
      />
    </div>
  );
}

export default memo(OSNode);
