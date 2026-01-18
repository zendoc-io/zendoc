package services

import (
	"backend/models"
	"context"
	"fmt"
	"strconv"
)

// GetInfrastructureGraph aggregates all infrastructure entities into a graph structure
func GetInfrastructureGraph() (*models.GraphData, error) {
	db := DB
	ctx := context.Background()

	nodes := []models.GraphNode{}
	edges := []models.GraphEdge{}

	// 1. Get all OS entities
	osQuery := `SELECT id, name FROM devices.os ORDER BY name ASC`
	type OSRecord struct {
		ID   string `db:"id"`
		Name string `db:"name"`
	}
	var osRecords []OSRecord
	err := db.SelectContext(ctx, &osRecords, osQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get OS records: %v", err)
	}

	osMap := make(map[string]string) // map[osID]osName
	for _, os := range osRecords {
		osMap[os.ID] = os.Name
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("os-%s", os.ID),
			Type:   models.NodeTypeOS,
			Label:  os.Name,
			Status: "",
			Data: map[string]interface{}{
				"name": os.Name,
			},
		})
	}

	// 2. Get all Subnets
	subnetQuery := `SELECT id, name, mask, gateway::text, dns::text FROM devices.subnet ORDER BY name ASC`
	type SubnetRecord struct {
		ID      string `db:"id"`
		Name    string `db:"name"`
		Mask    string `db:"mask"`
		Gateway string `db:"gateway"`
		DNS     string `db:"dns"`
	}
	var subnetRecords []SubnetRecord
	err = db.SelectContext(ctx, &subnetRecords, subnetQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get subnet records: %v", err)
	}

	for _, subnet := range subnetRecords {
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("subnet-%s", subnet.ID),
			Type:   models.NodeTypeSubnet,
			Label:  subnet.Name,
			Status: "",
			Data: map[string]interface{}{
				"name":    subnet.Name,
				"mask":    subnet.Mask,
				"gateway": subnet.Gateway,
				"dns":     subnet.DNS,
			},
		})
	}

	// 3. Get all Roles
	roleQuery := `SELECT id, name FROM devices.role ORDER BY name ASC`
	type RoleRecord struct {
		ID   string `db:"id"`
		Name string `db:"name"`
	}
	var roleRecords []RoleRecord
	err = db.SelectContext(ctx, &roleRecords, roleQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get role records: %v", err)
	}

	for _, role := range roleRecords {
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("role-%s", role.ID),
			Type:   models.NodeTypeRole,
			Label:  role.Name,
			Status: "",
			Data: map[string]interface{}{
				"name": role.Name,
			},
		})
	}

	// 4. Get all Servers with their relationships
	serverQuery := `
		SELECT 
			s.id,
			s.name,
			s.status,
			s.ip::text,
			s.subnet_id,
			s.os_id
		FROM devices.server s
		ORDER BY s.name ASC
	`
	type ServerRecord struct {
		ID       string `db:"id"`
		Name     string `db:"name"`
		Status   string `db:"status"`
		IP       string `db:"ip"`
		SubnetID string `db:"subnet_id"`
		OsID     string `db:"os_id"`
	}
	var serverRecords []ServerRecord
	err = db.SelectContext(ctx, &serverRecords, serverQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get server records: %v", err)
	}

	for _, server := range serverRecords {
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("server-%s", server.ID),
			Type:   models.NodeTypeServer,
			Label:  server.Name,
			Status: server.Status,
			Data: map[string]interface{}{
				"name":   server.Name,
				"ip":     server.IP,
				"status": server.Status,
			},
		})

		// Create edge: Server -> Subnet
		if server.SubnetID != "" {
			edges = append(edges, models.GraphEdge{
				ID:     fmt.Sprintf("server-%s-subnet-%s", server.ID, server.SubnetID),
				Source: fmt.Sprintf("server-%s", server.ID),
				Target: fmt.Sprintf("subnet-%s", server.SubnetID),
				Type:   models.EdgeTypeBelongsTo,
				Label:  "",
			})
		}

		// Create edge: Server -> OS
		if server.OsID != "" {
			edges = append(edges, models.GraphEdge{
				ID:     fmt.Sprintf("server-%s-os-%s", server.ID, server.OsID),
				Source: fmt.Sprintf("server-%s", server.ID),
				Target: fmt.Sprintf("os-%s", server.OsID),
				Type:   models.EdgeTypeRunsOS,
				Label:  "",
			})
		}
	}

	// 5. Get Server-Role relationships
	serverRoleQuery := `
		SELECT server_id, role_id 
		FROM devices.server_role
	`
	type ServerRoleRecord struct {
		ServerID string `db:"server_id"`
		RoleID   string `db:"role_id"`
	}
	var serverRoleRecords []ServerRoleRecord
	err = db.SelectContext(ctx, &serverRoleRecords, serverRoleQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get server-role records: %v", err)
	}

	for _, sr := range serverRoleRecords {
		edges = append(edges, models.GraphEdge{
			ID:     fmt.Sprintf("server-%s-role-%s", sr.ServerID, sr.RoleID),
			Source: fmt.Sprintf("server-%s", sr.ServerID),
			Target: fmt.Sprintf("role-%s", sr.RoleID),
			Type:   models.EdgeTypeHasRole,
			Label:  "",
		})
	}

	// 6. Get all VMs with their relationships
	vmQuery := `
		SELECT 
			v.id,
			v.name,
			v.status,
			v.host_server_id,
			v.vcpu,
			v.ram_gb,
			v.disk_gb,
			v.os_id,
			v.ip::text,
			v.subnet_id
		FROM devices.vm v
		ORDER BY v.name ASC
	`
	type VMRecord struct {
		ID           string `db:"id"`
		Name         string `db:"name"`
		Status       string `db:"status"`
		HostServerID string `db:"host_server_id"`
		VCPU         int    `db:"vcpu"`
		RAMGB        int    `db:"ram_gb"`
		DiskGB       int    `db:"disk_gb"`
		OsID         string `db:"os_id"`
		IP           string `db:"ip"`
		SubnetID     string `db:"subnet_id"`
	}
	var vmRecords []VMRecord
	err = db.SelectContext(ctx, &vmRecords, vmQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get VM records: %v", err)
	}

	for _, vm := range vmRecords {
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("vm-%s", vm.ID),
			Type:   models.NodeTypeVM,
			Label:  vm.Name,
			Status: vm.Status,
			Data: map[string]interface{}{
				"name":   vm.Name,
				"ip":     vm.IP,
				"status": vm.Status,
				"vcpu":   vm.VCPU,
				"ram_gb": vm.RAMGB,
			},
		})

		// Create edge: Server -> VM (HOSTS)
		if vm.HostServerID != "" {
			edges = append(edges, models.GraphEdge{
				ID:     fmt.Sprintf("server-%s-vm-%s", vm.HostServerID, vm.ID),
				Source: fmt.Sprintf("server-%s", vm.HostServerID),
				Target: fmt.Sprintf("vm-%s", vm.ID),
				Type:   models.EdgeTypeHosts,
				Label:  "",
			})
		}

		// Create edge: VM -> Subnet
		if vm.SubnetID != "" {
			edges = append(edges, models.GraphEdge{
				ID:     fmt.Sprintf("vm-%s-subnet-%s", vm.ID, vm.SubnetID),
				Source: fmt.Sprintf("vm-%s", vm.ID),
				Target: fmt.Sprintf("subnet-%s", vm.SubnetID),
				Type:   models.EdgeTypeBelongsTo,
				Label:  "",
			})
		}

		// Create edge: VM -> OS
		if vm.OsID != "" {
			edges = append(edges, models.GraphEdge{
				ID:     fmt.Sprintf("vm-%s-os-%s", vm.ID, vm.OsID),
				Source: fmt.Sprintf("vm-%s", vm.ID),
				Target: fmt.Sprintf("os-%s", vm.OsID),
				Type:   models.EdgeTypeRunsOS,
				Label:  "",
			})
		}
	}

	// 7. Get all Services with their relationships
	serviceQuery := `
		SELECT 
			s.id,
			s.name,
			s.type,
			s.status,
			s.host_type,
			s.host_id,
			s.port,
			s.protocol,
			s.health
		FROM devices.service s
		ORDER BY s.name ASC
	`
	type ServiceRecord struct {
		ID       string `db:"id"`
		Name     string `db:"name"`
		Type     string `db:"type"`
		Status   string `db:"status"`
		HostType string `db:"host_type"`
		HostID   string `db:"host_id"`
		Port     int    `db:"port"`
		Protocol string `db:"protocol"`
		Health   string `db:"health"`
	}
	var serviceRecords []ServiceRecord
	err = db.SelectContext(ctx, &serviceRecords, serviceQuery)
	if err != nil {
		return nil, fmt.Errorf("Failed to get service records: %v", err)
	}

	for _, service := range serviceRecords {
		nodes = append(nodes, models.GraphNode{
			ID:     fmt.Sprintf("service-%s", service.ID),
			Type:   models.NodeTypeService,
			Label:  service.Name,
			Status: service.Status,
			Data: map[string]interface{}{
				"name":     service.Name,
				"type":     service.Type,
				"status":   service.Status,
				"port":     service.Port,
				"protocol": service.Protocol,
				"health":   service.Health,
			},
		})

		// Create edge: Server/VM -> Service (RUNS)
		if service.HostID != "" {
			var sourceID string
			if service.HostType == "SERVER" {
				sourceID = fmt.Sprintf("server-%s", service.HostID)
			} else if service.HostType == "VM" {
				sourceID = fmt.Sprintf("vm-%s", service.HostID)
			}

			if sourceID != "" {
				edges = append(edges, models.GraphEdge{
					ID:     fmt.Sprintf("%s-service-%s", sourceID, service.ID),
					Source: sourceID,
					Target: fmt.Sprintf("service-%s", service.ID),
					Type:   models.EdgeTypeRuns,
					Label:  "",
				})
			}
		}
	}

	return &models.GraphData{
		Nodes: nodes,
		Edges: edges,
	}, nil
}

// Helper function to convert int to string
func intToString(i int) string {
	return strconv.Itoa(i)
}
