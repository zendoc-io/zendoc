import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type RoleNodeData = {
  label: string;
  nodeType: string;
};

function RoleNode({ data }: NodeProps<RoleNodeData>) {
  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-yellow-500"
      />
      <div className="w-[220px] rounded-lg border-2 border-yellow-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-yellow-400 hover:shadow-xl">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-yellow-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">ROLE</span>
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
        className="!bg-yellow-500"
      />
    </div>
  );
}

export default memo(RoleNode);
