import useSWR from "swr";
import type { GraphData, GraphFilters } from "@/types/graph";
import type { ApiResponse } from "@/types/responses";
import { apiFetch } from "@/utils/api";
import { useMemo } from "react";
import type { Node, Edge } from "reactflow";
import {
  calculateHierarchicalLayout,
  createReactFlowEdges,
} from "@/utils/graphLayout";

export function useGraphData(filters: GraphFilters) {
  const { data, error, mutate } = useSWR<ApiResponse<GraphData>>(
    "/device/graph",
    apiFetch,
    {
      refreshInterval: 30000, // Refresh every 30 seconds
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    },
  );

  const isLoading = !error && !data;

  const { nodes, edges } = useMemo(() => {
    if (!data?.data) {
      return { nodes: [], edges: [] };
    }

    const graphData = data.data;

    // Apply filters to nodes
    const filteredNodes = graphData.nodes.filter((node) => {
      // Type filters
      if (node.type === "SERVER" && !filters.showServers) return false;
      if (node.type === "VM" && !filters.showVMs) return false;
      if (node.type === "SERVICE" && !filters.showServices) return false;
      if (node.type === "SUBNET" && !filters.showSubnets) return false;
      if (node.type === "ROLE" && !filters.showRoles) return false;
      if (node.type === "OS" && !filters.showOS) return false;

      // Status filter
      if (
        filters.statusFilter.length > 0 &&
        node.status &&
        !filters.statusFilter.includes(node.status)
      ) {
        return false;
      }

      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesLabel = node.label.toLowerCase().includes(query);
        const matchesIP =
          node.data.ip && String(node.data.ip).toLowerCase().includes(query);
        return matchesLabel || matchesIP;
      }

      return true;
    });

    // Get IDs of filtered nodes
    const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

    // Filter edges to only include those connecting visible nodes
    const filteredEdges = graphData.edges.filter(
      (edge) =>
        filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target),
    );

    // Calculate layout
    const layoutedNodes = calculateHierarchicalLayout(
      filteredNodes,
      filteredEdges,
    );
    const reactFlowEdges = createReactFlowEdges(filteredEdges);

    return {
      nodes: layoutedNodes,
      edges: reactFlowEdges,
    };
  }, [data, filters]);

  return {
    nodes,
    edges,
    isLoading,
    error,
    refresh: mutate,
  };
}
