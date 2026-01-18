package models

// GraphNode represents a node in the infrastructure graph
type GraphNode struct {
	ID     string                 `json:"id"`     // Unique identifier: "server-123", "vm-456", "service-789"
	Type   string                 `json:"type"`   // SERVER, VM, SERVICE, SUBNET, ROLE, OS
	Label  string                 `json:"label"`  // Display name
	Status string                 `json:"status"` // Entity status (if applicable)
	Data   map[string]interface{} `json:"data"`   // Additional information (IP, port, health, etc.)
}

// GraphEdge represents a connection between nodes
type GraphEdge struct {
	ID     string `json:"id"`     // Unique identifier: "server-123-vm-456"
	Source string `json:"source"` // Source node ID
	Target string `json:"target"` // Target node ID
	Type   string `json:"type"`   // HOSTS, RUNS, BELONGS_TO, HAS_ROLE, RUNS_OS
	Label  string `json:"label"`  // Optional label for the edge
}

// GraphData represents the complete infrastructure graph
type GraphData struct {
	Nodes []GraphNode `json:"nodes"`
	Edges []GraphEdge `json:"edges"`
}

// Node types
const (
	NodeTypeServer  = "SERVER"
	NodeTypeVM      = "VM"
	NodeTypeService = "SERVICE"
	NodeTypeSubnet  = "SUBNET"
	NodeTypeRole    = "ROLE"
	NodeTypeOS      = "OS"
)

// Edge types
const (
	EdgeTypeHosts     = "HOSTS"
	EdgeTypeRuns      = "RUNS"
	EdgeTypeBelongsTo = "BELONGS_TO"
	EdgeTypeHasRole   = "HAS_ROLE"
	EdgeTypeRunsOS    = "RUNS_OS"
)
