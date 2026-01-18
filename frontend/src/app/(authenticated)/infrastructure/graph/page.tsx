"use client";

import { useState, useCallback, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import { useGraphData } from "@/hooks/useGraphData";
import type { GraphFilters } from "@/types/graph";
import ServerNode from "@/components/graph/ServerNode";
import VMNode from "@/components/graph/VMNode";
import ServiceNode from "@/components/graph/ServiceNode";
import SubnetNode from "@/components/graph/SubnetNode";
import RoleNode from "@/components/graph/RoleNode";
import OSNode from "@/components/graph/OSNode";
import GraphFiltersPanel from "@/components/graph/GraphFilters";
import GraphLegend from "@/components/graph/GraphLegend";
import { useRouter } from "next/navigation";

const nodeTypes: NodeTypes = {
  server: ServerNode,
  vm: VMNode,
  service: ServiceNode,
  subnet: SubnetNode,
  role: RoleNode,
  os: OSNode,
};

export default function GraphPage() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<GraphFilters>({
    showServers: true,
    showVMs: true,
    showServices: true,
    showSubnets: true,
    showRoles: true,
    showOS: true,
    statusFilter: [],
    searchQuery: "",
  });

  const {
    nodes: graphNodes,
    edges: graphEdges,
    isLoading,
    error,
  } = useGraphData(filters);
  const [nodes, setNodes, onNodesChange] = useNodesState(graphNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(graphEdges);

  // Update nodes and edges when graph data changes
  useEffect(() => {
    setNodes(graphNodes);
    setEdges(graphEdges);
  }, [graphNodes, graphEdges, setNodes, setEdges]);

  // Handle node click - navigate to detail page
  const onNodeClick = useCallback(
    (_event: any, node: any) => {
      const nodeId = node.id;
      const [type, id] = nodeId.split("-");

      switch (type) {
        case "server":
          router.push(`/infrastructure/servers/${id}`);
          break;
        case "vm":
          router.push(`/infrastructure/virtual-machines/${id}`);
          break;
        case "service":
          router.push(`/infrastructure/services/${id}`);
          break;
        // Subnets, Roles, and OS don't have detail pages yet
        default:
          break;
      }
    },
    [router],
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-gray-400">Loading infrastructure graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="mb-2 font-semibold text-red-400">
            Failed to load graph
          </p>
          <p className="text-sm text-gray-400">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 4rem)" }}>
      {/* Header */}
      <div className="border-b border-gray-700 bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Infrastructure Graph
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Visualize relationships between servers, VMs, services, and more
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{nodes.length} nodes</span>
            <span>•</span>
            <span>{edges.length} connections</span>
          </div>
        </div>
      </div>

      {/* Graph Canvas */}
      <div
        className="relative bg-gray-900"
        style={{ width: "100%", height: "calc(100vh - 12rem)" }}
      >
        {nodes.length === 0 && !isLoading && (
          <div className="absolute inset-0 z-50 flex h-full items-center justify-center">
            <p className="text-gray-400">
              No nodes to display. Filters may be hiding all nodes.
            </p>
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
            includeHiddenNodes: false,
          }}
          minZoom={0.1}
          maxZoom={1.5}
          defaultEdgeOptions={{
            animated: false,
          }}
        >
          <Background color="#374151" gap={16} />
          <Controls
            className="!border-gray-700 !bg-gray-800"
            showInteractive={false}
          />
          <MiniMap
            className="!border-gray-700 !bg-gray-800"
            nodeColor={(node) => {
              switch (node.type) {
                case "server":
                  return "#3b82f6";
                case "vm":
                  return "#a855f7";
                case "service":
                  return "#10b981";
                case "subnet":
                  return "#f97316";
                case "role":
                  return "#eab308";
                case "os":
                  return "#6b7280";
                default:
                  return "#374151";
              }
            }}
          />
        </ReactFlow>

        {/* Filters Panel */}
        <GraphFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          isOpen={filtersOpen}
          onToggle={() => setFiltersOpen(!filtersOpen)}
        />

        {/* Legend */}
        <GraphLegend />
      </div>
    </div>
  );
}
