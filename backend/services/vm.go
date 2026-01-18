package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
)

// SearchVMs searches for VMs with filters and pagination
func SearchVMs(params models.RSearchVMs) ([]models.VMSearchReturn, int, error) {
	db := DB
	var ctx = context.Background()

	// Base query with joins
	baseQuery := `
		FROM devices.vm v
		LEFT JOIN devices.server s ON v.host_server_id = s.id
		LEFT JOIN devices.os o ON v.os_id = o.id
		LEFT JOIN devices.subnet sub ON v.subnet_id = sub.id
		LEFT JOIN (
			SELECT vm_id, COUNT(*) as service_count
			FROM devices.vm_service
			GROUP BY vm_id
		) vs ON v.id = vs.vm_id
		WHERE 1=1
	`

	var args []interface{}
	argPos := 1

	// Add filters
	if params.Name != "" {
		baseQuery += fmt.Sprintf(" AND v.name ILIKE $%d", argPos)
		args = append(args, "%"+params.Name+"%")
		argPos++
	}

	if params.Status != "" {
		baseQuery += fmt.Sprintf(" AND v.status = $%d", argPos)
		args = append(args, params.Status)
		argPos++
	}

	if params.HostID != "" {
		baseQuery += fmt.Sprintf(" AND v.host_server_id = $%d", argPos)
		args = append(args, params.HostID)
		argPos++
	}

	// Count total results
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int
	err := db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count VMs: %v", err)
	}

	// Build select query
	selectQuery := `
		SELECT 
			v.*,
			s.name as host_server_name,
			o.name as os_name,
			sub.name as subnet_name,
			COALESCE(vs.service_count, 0) as service_count
	` + baseQuery

	// Add sorting
	sortBy := "v.name"
	if params.SortBy != "" {
		sortBy = "v." + params.SortBy
	}
	sortOrder := "ASC"
	if params.SortOrder == "desc" {
		sortOrder = "DESC"
	}
	selectQuery += fmt.Sprintf(" ORDER BY %s %s", sortBy, sortOrder)

	// Add pagination
	limit := 50
	if params.Limit != "" {
		if l, err := strconv.Atoi(params.Limit); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}
	offset := 0
	if params.Offset != "" {
		if o, err := strconv.Atoi(params.Offset); err == nil && o >= 0 {
			offset = o
		}
	}

	selectQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	// Execute query
	var results []models.VMSearchReturn
	err = db.SelectContext(ctx, &results, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to search VMs: %v", err)
	}

	return results, total, nil
}

// GetVMByID retrieves a single VM by ID
func GetVMByID(vmID string) (models.VMSearchReturn, error) {
	db := DB
	var ctx = context.Background()

	query := `
		SELECT 
			v.*,
			s.name as host_server_name,
			o.name as os_name,
			sub.name as subnet_name,
			COALESCE(vs.service_count, 0) as service_count
		FROM devices.vm v
		LEFT JOIN devices.server s ON v.host_server_id = s.id
		LEFT JOIN devices.os o ON v.os_id = o.id
		LEFT JOIN devices.subnet sub ON v.subnet_id = sub.id
		LEFT JOIN (
			SELECT vm_id, COUNT(*) as service_count
			FROM devices.vm_service
			GROUP BY vm_id
		) vs ON v.id = vs.vm_id
		WHERE v.id = $1
	`

	var vm models.VMSearchReturn
	err := db.GetContext(ctx, &vm, query, vmID)
	if err != nil {
		if err == sql.ErrNoRows {
			return vm, errors.New("VM not found")
		}
		return vm, fmt.Errorf("Failed to get VM: %v", err)
	}

	return vm, nil
}

// CreateVM creates a new virtual machine
func CreateVM(body models.RCreateVM, userID string) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed: %v", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// Verify host server exists
	var serverExists bool
	err = tx.GetContext(ctx, &serverExists, "SELECT EXISTS(SELECT 1 FROM devices.server WHERE id = $1)", body.HostServerID)
	if err != nil || !serverExists {
		err = errors.New("Host server not found")
		return err
	}

	// Verify OS exists
	var osExists bool
	err = tx.GetContext(ctx, &osExists, "SELECT EXISTS(SELECT 1 FROM devices.os WHERE id = $1)", body.OsID)
	if err != nil || !osExists {
		err = errors.New("OS not found")
		return err
	}

	// Insert VM
	query := `
		INSERT INTO devices.vm (
			name, status, host_server_id, vcpu, ram_gb, disk_gb, os_id, ip, subnet_id, created_by, updated_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`

	_, err = tx.ExecContext(ctx, query,
		body.Name,
		body.Status,
		body.HostServerID,
		body.VCPU,
		body.RAMGB,
		body.DiskGB,
		body.OsID,
		body.IP,
		body.SubnetID,
		userID,
		userID,
	)

	if err != nil {
		err = errors.New("Failed to create VM")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// UpdateVM updates an existing virtual machine
func UpdateVM(body models.RUpdateVM, userID string) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed: %v", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// Verify VM exists
	var vmExists bool
	err = tx.GetContext(ctx, &vmExists, "SELECT EXISTS(SELECT 1 FROM devices.vm WHERE id = $1)", body.ID)
	if err != nil || !vmExists {
		err = errors.New("VM not found")
		return err
	}

	// Update VM
	query := `
		UPDATE devices.vm
		SET name = $1, status = $2, host_server_id = $3, vcpu = $4, ram_gb = $5, 
		    disk_gb = $6, os_id = $7, ip = $8, subnet_id = $9, updated_by = $10, 
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $11
	`

	result, err := tx.ExecContext(ctx, query,
		body.Name,
		body.Status,
		body.HostServerID,
		body.VCPU,
		body.RAMGB,
		body.DiskGB,
		body.OsID,
		body.IP,
		body.SubnetID,
		userID,
		body.ID,
	)

	if err != nil {
		err = errors.New("Failed to update VM")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("VM not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// DeleteVM deletes a virtual machine
func DeleteVM(vmID string) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed: %v", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// Delete VM (CASCADE will handle vm_service)
	result, err := tx.ExecContext(ctx, "DELETE FROM devices.vm WHERE id = $1", vmID)
	if err != nil {
		err = errors.New("Failed to delete VM")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("VM not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// GetVMsByServerID retrieves all VMs hosted on a specific server
func GetVMsByServerID(serverID string, limit int, offset int) ([]models.VMSearchReturn, int, error) {
	db := DB
	var ctx = context.Background()

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	// Count total
	var total int
	countQuery := "SELECT COUNT(*) FROM devices.vm WHERE host_server_id = $1"
	err := db.GetContext(ctx, &total, countQuery, serverID)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count VMs: %v", err)
	}

	// Select query
	query := `
		SELECT 
			v.*,
			s.name as host_server_name,
			o.name as os_name,
			sub.name as subnet_name,
			COALESCE(vs.service_count, 0) as service_count
		FROM devices.vm v
		LEFT JOIN devices.server s ON v.host_server_id = s.id
		LEFT JOIN devices.os o ON v.os_id = o.id
		LEFT JOIN devices.subnet sub ON v.subnet_id = sub.id
		LEFT JOIN (
			SELECT host_id, COUNT(*) as service_count
			FROM devices.service
			WHERE host_type = 'VM'
			GROUP BY host_id
		) vs ON v.id = vs.host_id
		WHERE v.host_server_id = $1
		ORDER BY v.name ASC
		LIMIT $2 OFFSET $3
	`

	var results []models.VMSearchReturn
	err = db.SelectContext(ctx, &results, query, serverID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to get VMs by server: %v", err)
	}

	return results, total, nil
}
