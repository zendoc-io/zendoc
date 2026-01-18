// Graph data types matching backend models
export type NodeType = "SERVER" | "VM" | "SERVICE" | "SUBNET" | "ROLE" | "OS";
export type EdgeType = "HOSTS" | "RUNS" | "BELONGS_TO" | "HAS_ROLE" | "RUNS_OS";

export interface GraphNode {
  id: string; // "server-123", "vm-456", etc.
  type: NodeType;
  label: string;
  status?: string;
  data: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: EdgeType;
  label?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

// Filter state
export interface GraphFilters {
  showServers: boolean;
  showVMs: boolean;
  showServices: boolean;
  showSubnets: boolean;
  showRoles: boolean;
  showOS: boolean;
  statusFilter: string[];
  searchQuery: string;
}
