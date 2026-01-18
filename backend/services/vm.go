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
			SELECT host_id, COUNT(*) as service_count
			FROM devices.service
			WHERE host_type = 'VM'
			GROUP BY host_id
		) vs ON v.id = vs.host_id
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
			SELECT host_id, COUNT(*) as service_count
			FROM devices.service
			WHERE host_type = 'VM'
			GROUP BY host_id
		) vs ON v.id = vs.host_id
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
func CreateVM(body models.RCreateVM, userID string, userName string) error {
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
		RETURNING id
	`

	var vmID string
	err = tx.QueryRowContext(ctx, query,
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
	).Scan(&vmID)

	if err != nil {
		err = errors.New("Failed to create VM")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	// Create activity log after successful commit
	go CreateActivityLog(
		models.ActivityEntityVM,
		vmID,
		body.Name,
		models.ActivityActionCreated,
		[]models.ActivityChange{},
		userID,
		userName,
	)

	return nil
}

// UpdateVM updates an existing virtual machine
func UpdateVM(body models.RUpdateVM, userID string, userName string) error {
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

	// Get old values before update
	var oldVM struct {
		Name         string          `db:"name"`
		Status       models.VMStatus `db:"status"`
		HostServerID string          `db:"host_server_id"`
		VCPU         int16           `db:"vcpu"`
		RAMGB        int16           `db:"ram_gb"`
		DiskGB       int32           `db:"disk_gb"`
		OsID         string          `db:"os_id"`
		IP           sql.NullString  `db:"ip"`
		SubnetID     sql.NullString  `db:"subnet_id"`
	}
	err = tx.GetContext(ctx, &oldVM, "SELECT name, status, host_server_id, vcpu, ram_gb, disk_gb, os_id, ip::text, subnet_id FROM devices.vm WHERE id = $1", body.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("VM not found")
		}
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

	// Track changes
	changes := []models.ActivityChange{}
	if oldVM.Name != body.Name {
		changes = append(changes, models.ActivityChange{
			Field:    "name",
			OldValue: oldVM.Name,
			NewValue: body.Name,
		})
	}
	if oldVM.Status != body.Status {
		changes = append(changes, models.ActivityChange{
			Field:    "status",
			OldValue: string(oldVM.Status),
			NewValue: string(body.Status),
		})
	}
	if oldVM.HostServerID != body.HostServerID {
		changes = append(changes, models.ActivityChange{
			Field:    "host_server_id",
			OldValue: oldVM.HostServerID,
			NewValue: body.HostServerID,
		})
	}
	if oldVM.VCPU != body.VCPU {
		changes = append(changes, models.ActivityChange{
			Field:    "vcpu",
			OldValue: oldVM.VCPU,
			NewValue: body.VCPU,
		})
	}
	if oldVM.RAMGB != body.RAMGB {
		changes = append(changes, models.ActivityChange{
			Field:    "ram_gb",
			OldValue: oldVM.RAMGB,
			NewValue: body.RAMGB,
		})
	}
	if oldVM.DiskGB != body.DiskGB {
		changes = append(changes, models.ActivityChange{
			Field:    "disk_gb",
			OldValue: oldVM.DiskGB,
			NewValue: body.DiskGB,
		})
	}
	if oldVM.OsID != body.OsID {
		changes = append(changes, models.ActivityChange{
			Field:    "os_id",
			OldValue: oldVM.OsID,
			NewValue: body.OsID,
		})
	}
	// Compare IP (handle sql.NullString properly)
	oldIPStr := ""
	newIPStr := ""
	if oldVM.IP.Valid {
		oldIPStr = oldVM.IP.String
	}
	if body.IP != nil {
		newIPStr = *body.IP
	}
	if oldIPStr != newIPStr {
		changes = append(changes, models.ActivityChange{
			Field:    "ip",
			OldValue: oldIPStr,
			NewValue: newIPStr,
		})
	}
	// Compare SubnetID (handle sql.NullString properly)
	oldSubnetStr := ""
	newSubnetStr := ""
	if oldVM.SubnetID.Valid {
		oldSubnetStr = oldVM.SubnetID.String
	}
	if body.SubnetID != nil {
		newSubnetStr = *body.SubnetID
	}
	if oldSubnetStr != newSubnetStr {
		changes = append(changes, models.ActivityChange{
			Field:    "subnet_id",
			OldValue: oldSubnetStr,
			NewValue: newSubnetStr,
		})
	}

	// Create activity log if there were changes
	if len(changes) > 0 {
		go CreateActivityLog(
			models.ActivityEntityVM,
			body.ID,
			body.Name,
			models.ActivityActionUpdated,
			changes,
			userID,
			userName,
		)
	}

	// Create notification for critical status changes
	if oldVM.Status != body.Status && (body.Status == models.VMStatusError || body.Status == models.VMStatusStopped) {
		go createNotificationForAllUsers(
			models.NotificationTypeVM,
			models.SeverityCritical,
			fmt.Sprintf("VM %s status changed to %s", body.Name, string(body.Status)),
			fmt.Sprintf("VM %s (ID: %s) status changed from %s to %s", body.Name, body.ID, string(oldVM.Status), string(body.Status)),
			fmt.Sprintf(`{"vmId":"%s","oldStatus":"%s","newStatus":"%s"}`, body.ID, string(oldVM.Status), string(body.Status)),
		)
	}

	return nil
}

// DeleteVM deletes a virtual machine
func DeleteVM(vmID string, userID string, userName string) error {
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

	// Get VM name before deletion
	var vmName string
	err = tx.GetContext(ctx, &vmName, "SELECT name FROM devices.vm WHERE id = $1", vmID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("VM not found")
		}
		return err
	}

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

	// Create activity log after successful deletion
	go CreateActivityLog(
		models.ActivityEntityVM,
		vmID,
		vmName,
		models.ActivityActionDeleted,
		[]models.ActivityChange{},
		userID,
		userName,
	)

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
