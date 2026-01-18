import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

export type SubnetNodeData = {
  label: string;
  mask?: string;
  gateway?: string;
  nodeType: string;
};

function SubnetNode({ data }: NodeProps<SubnetNodeData>) {
  return (
    <div className="group relative">
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-500"
      />
      <div className="w-[220px] rounded-lg border-2 border-orange-500 bg-gray-800 p-4 shadow-lg transition-all hover:border-orange-400 hover:shadow-xl">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <svg
                className="h-5 w-5 flex-shrink-0 text-orange-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m-9 9a9 9 0 019-9"
                />
              </svg>
              <span className="text-xs font-medium text-gray-400">SUBNET</span>
            </div>
            <div className="mb-2 truncate text-sm font-semibold text-white">
              {data.label}
            </div>
            {data.mask && (
              <div className="font-mono text-xs text-gray-400">{data.mask}</div>
            )}
          </div>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-orange-500"
      />
    </div>
  );
}

export default memo(SubnetNode);
