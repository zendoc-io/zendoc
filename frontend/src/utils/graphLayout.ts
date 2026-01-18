import type { Node, Edge } from "reactflow";
import type { GraphNode, GraphEdge } from "@/types/graph";

// Spacing constants
const HORIZONTAL_SPACING = 280;
const VERTICAL_SPACING = 180;
const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;

interface TierGroup {
  tier: number;
  nodes: GraphNode[];
}

export function calculateHierarchicalLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
): Node[] {
  // Group nodes by tier
  const tiers: TierGroup[] = [
    { tier: 0, nodes: [] }, // Supporting entities: Subnets, Roles, OS
    { tier: 1, nodes: [] }, // Servers
    { tier: 2, nodes: [] }, // VMs
    { tier: 3, nodes: [] }, // Services
  ];

  graphNodes.forEach((node) => {
    switch (node.type) {
      case "SUBNET":
      case "ROLE":
      case "OS":
        tiers[0].nodes.push(node);
        break;
      case "SERVER":
        tiers[1].nodes.push(node);
        break;
      case "VM":
        tiers[2].nodes.push(node);
        break;
      case "SERVICE":
        tiers[3].nodes.push(node);
        break;
    }
  });

  // Build edge lookup for parent-child relationships
  const childrenMap = new Map<string, string[]>();
  const parentMap = new Map<string, string>();

  graphEdges.forEach((edge) => {
    if (edge.type === "HOSTS" || edge.type === "RUNS") {
      // Track children
      const children = childrenMap.get(edge.source) || [];
      children.push(edge.target);
      childrenMap.set(edge.source, children);

      // Track parent
      parentMap.set(edge.target, edge.source);
    }
  });

  const positionedNodes: Node[] = [];
  let globalX = 0;

  // Position each tier
  tiers.forEach((tierGroup, tierIndex) => {
    const y = tierIndex * VERTICAL_SPACING + 50;

    if (tierGroup.nodes.length === 0) return;

    // For tier 1 (servers) and tier 2 (VMs), group by parent
    if (tierIndex === 1) {
      // Servers - simple horizontal layout
      tierGroup.nodes.forEach((node, idx) => {
        const x = idx * HORIZONTAL_SPACING + 50;
        positionedNodes.push(createReactFlowNode(node, x, y));
      });
    } else if (tierIndex === 2) {
      // VMs - position under their host servers
      const positioned = new Set<string>();
      let fallbackX = 0;

      tierGroup.nodes.forEach((node) => {
        const parentId = parentMap.get(node.id);
        if (parentId) {
          // Find parent position
          const parent = positionedNodes.find((n) => n.id === parentId);
          if (parent) {
            // Count how many children this parent already has positioned
            const siblings = tierGroup.nodes.filter(
              (n) => parentMap.get(n.id) === parentId,
            );
            const siblingIndex = siblings.findIndex((n) => n.id === node.id);

            // Position VMs in a row under their server
            const offsetX =
              siblingIndex * (NODE_WIDTH + 40) -
              (siblings.length * (NODE_WIDTH + 40)) / 2 +
              NODE_WIDTH / 2;
            const x = parent.position.x + offsetX;

            positionedNodes.push(createReactFlowNode(node, x, y));
            positioned.add(node.id);
            return;
          }
        }

        // Fallback: no parent found
        if (!positioned.has(node.id)) {
          positionedNodes.push(createReactFlowNode(node, fallbackX, y));
          positioned.add(node.id);
          fallbackX += HORIZONTAL_SPACING;
        }
      });
    } else if (tierIndex === 3) {
      // Services - position under their host (server or VM)
      const positioned = new Set<string>();
      let fallbackX = 0;

      tierGroup.nodes.forEach((node) => {
        const parentId = parentMap.get(node.id);
        if (parentId) {
          const parent = positionedNodes.find((n) => n.id === parentId);
          if (parent) {
            // Count siblings
            const siblings = tierGroup.nodes.filter(
              (n) => parentMap.get(n.id) === parentId,
            );
            const siblingIndex = siblings.findIndex((n) => n.id === node.id);

            // Position services in a row under their host
            const offsetX =
              siblingIndex * (NODE_WIDTH + 30) -
              (siblings.length * (NODE_WIDTH + 30)) / 2 +
              NODE_WIDTH / 2;
            const x = parent.position.x + offsetX;

            positionedNodes.push(createReactFlowNode(node, x, y));
            positioned.add(node.id);
            return;
          }
        }

        // Fallback
        if (!positioned.has(node.id)) {
          positionedNodes.push(createReactFlowNode(node, fallbackX, y));
          positioned.add(node.id);
          fallbackX += HORIZONTAL_SPACING;
        }
      });
    } else {
      // Tier 0 (supporting entities) - simple horizontal layout
      tierGroup.nodes.forEach((node, idx) => {
        const x = idx * HORIZONTAL_SPACING + 50;
        positionedNodes.push(createReactFlowNode(node, x, y));
      });
    }
  });

  return positionedNodes;
}

function createReactFlowNode(graphNode: GraphNode, x: number, y: number): Node {
  return {
    id: graphNode.id,
    type: graphNode.type.toLowerCase(),
    position: { x, y },
    data: {
      ...graphNode.data,
      label: graphNode.label,
      status: graphNode.status,
      nodeType: graphNode.type,
    },
  };
}

export function createReactFlowEdges(graphEdges: GraphEdge[]): Edge[] {
  return graphEdges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    type: "smoothstep",
    animated: false,
    style: getEdgeStyle(edge.type),
    data: {
      edgeType: edge.type,
    },
  }));
}

function getEdgeStyle(edgeType: string) {
  switch (edgeType) {
    case "HOSTS":
      return { stroke: "#3b82f6", strokeWidth: 2 }; // Blue
    case "RUNS":
      return { stroke: "#10b981", strokeWidth: 2 }; // Green
    case "BELONGS_TO":
      return { stroke: "#f97316", strokeWidth: 1.5, strokeDasharray: "5,5" }; // Orange dashed
    case "HAS_ROLE":
      return { stroke: "#eab308", strokeWidth: 1.5, strokeDasharray: "3,3" }; // Yellow dotted
    case "RUNS_OS":
      return { stroke: "#6b7280", strokeWidth: 1.5, strokeDasharray: "5,5" }; // Gray dashed
    default:
      return { stroke: "#374151", strokeWidth: 1.5 };
  }
}
