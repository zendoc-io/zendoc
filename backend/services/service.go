package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
)

// SearchServices searches for services with filters and pagination
func SearchServices(params models.RSearchServices) ([]models.ServiceSearchReturn, int, error) {
	db := DB
	var ctx = context.Background()

	// Base query with joins to get host name
	baseQuery := `
		FROM devices.service svc
		LEFT JOIN devices.server srv ON svc.host_type = 'SERVER' AND svc.host_id = srv.id
		LEFT JOIN devices.vm vm ON svc.host_type = 'VM' AND svc.host_id = vm.id
		WHERE 1=1
	`

	var args []interface{}
	argPos := 1

	// Add filters
	if params.Name != "" {
		baseQuery += fmt.Sprintf(" AND svc.name ILIKE $%d", argPos)
		args = append(args, "%"+params.Name+"%")
		argPos++
	}

	if params.Type != "" {
		baseQuery += fmt.Sprintf(" AND svc.type = $%d", argPos)
		args = append(args, params.Type)
		argPos++
	}

	if params.Status != "" {
		baseQuery += fmt.Sprintf(" AND svc.status = $%d", argPos)
		args = append(args, params.Status)
		argPos++
	}

	if params.HostType != "" {
		baseQuery += fmt.Sprintf(" AND svc.host_type = $%d", argPos)
		args = append(args, params.HostType)
		argPos++
	}

	// Count total results
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int
	err := db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count services: %v", err)
	}

	// Build select query
	selectQuery := `
		SELECT 
			svc.*,
			COALESCE(srv.name, vm.name, '') as host_name
	` + baseQuery

	// Add sorting
	sortBy := "svc.name"
	if params.SortBy != "" {
		sortBy = "svc." + params.SortBy
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
	var results []models.ServiceSearchReturn
	err = db.SelectContext(ctx, &results, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to search services: %v", err)
	}

	return results, total, nil
}

// GetServiceByID retrieves a single service by ID
func GetServiceByID(serviceID string) (models.ServiceSearchReturn, error) {
	db := DB
	var ctx = context.Background()

	query := `
		SELECT 
			svc.*,
			CASE 
				WHEN svc.host_type = 'SERVER' THEN 
					(SELECT name FROM devices.server WHERE id = svc.host_id)
				WHEN svc.host_type = 'VM' THEN 
					(SELECT name FROM devices.vm WHERE id = svc.host_id)
			END as host_name
		FROM devices.service svc
		WHERE svc.id = $1
	`

	var service models.ServiceSearchReturn
	err := db.GetContext(ctx, &service, query, serviceID)
	if err != nil {
		if err == sql.ErrNoRows {
			return service, errors.New("Service not found")
		}
		return service, fmt.Errorf("Failed to get service: %v", err)
	}

	return service, nil
}

// CreateService creates a new service
func CreateService(body models.RCreateService, userID string, userName string) error {
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

	// Verify host exists
	var hostExists bool
	if body.HostType == "SERVER" {
		err = tx.GetContext(ctx, &hostExists, "SELECT EXISTS(SELECT 1 FROM devices.server WHERE id = $1)", body.HostID)
	} else if body.HostType == "VM" {
		err = tx.GetContext(ctx, &hostExists, "SELECT EXISTS(SELECT 1 FROM devices.vm WHERE id = $1)", body.HostID)
	}
	if err != nil || !hostExists {
		err = errors.New("Host not found")
		return err
	}

	// Insert service
	query := `
		INSERT INTO devices.service (
			name, type, status, host_type, host_id, port, protocol, health, created_by, updated_by
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		RETURNING id
	`

	var serviceID string
	err = tx.QueryRowContext(ctx, query,
		body.Name,
		body.Type,
		body.Status,
		body.HostType,
		body.HostID,
		body.Port,
		body.Protocol,
		body.Health,
		userID,
		userID,
	).Scan(&serviceID)

	if err != nil {
		err = errors.New("Failed to create service")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	// Create activity log after successful commit
	go CreateActivityLog(
		models.ActivityEntityService,
		serviceID,
		body.Name,
		models.ActivityActionCreated,
		[]models.ActivityChange{},
		userID,
		userName,
	)

	return nil
}

// UpdateService updates an existing service
func UpdateService(body models.RUpdateService, userID string, userName string) error {
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
	var oldService struct {
		Name     string               `db:"name"`
		Type     models.ServiceType   `db:"type"`
		Status   models.ServiceStatus `db:"status"`
		HostType string               `db:"host_type"`
		HostID   string               `db:"host_id"`
		Port     int32                `db:"port"`
		Protocol string               `db:"protocol"`
		Health   models.ServiceHealth `db:"health"`
	}
	err = tx.GetContext(ctx, &oldService, "SELECT name, type, status, host_type, host_id, port, protocol, health FROM devices.service WHERE id = $1", body.ID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("Service not found")
		}
		return err
	}

	// Update service
	query := `
		UPDATE devices.service
		SET name = $1, type = $2, status = $3, host_type = $4, host_id = $5, 
		    port = $6, protocol = $7, health = $8, updated_by = $9, 
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $10
	`

	result, err := tx.ExecContext(ctx, query,
		body.Name,
		body.Type,
		body.Status,
		body.HostType,
		body.HostID,
		body.Port,
		body.Protocol,
		body.Health,
		userID,
		body.ID,
	)

	if err != nil {
		err = errors.New("Failed to update service")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Service not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	// Track changes
	changes := []models.ActivityChange{}
	if oldService.Name != body.Name {
		changes = append(changes, models.ActivityChange{
			Field:    "name",
			OldValue: oldService.Name,
			NewValue: body.Name,
		})
	}
	if oldService.Type != body.Type {
		changes = append(changes, models.ActivityChange{
			Field:    "type",
			OldValue: string(oldService.Type),
			NewValue: string(body.Type),
		})
	}
	if oldService.Status != body.Status {
		changes = append(changes, models.ActivityChange{
			Field:    "status",
			OldValue: string(oldService.Status),
			NewValue: string(body.Status),
		})
	}
	if oldService.HostType != body.HostType {
		changes = append(changes, models.ActivityChange{
			Field:    "host_type",
			OldValue: oldService.HostType,
			NewValue: body.HostType,
		})
	}
	if oldService.HostID != body.HostID {
		changes = append(changes, models.ActivityChange{
			Field:    "host_id",
			OldValue: oldService.HostID,
			NewValue: body.HostID,
		})
	}
	if oldService.Port != body.Port {
		changes = append(changes, models.ActivityChange{
			Field:    "port",
			OldValue: oldService.Port,
			NewValue: body.Port,
		})
	}
	if oldService.Protocol != body.Protocol {
		changes = append(changes, models.ActivityChange{
			Field:    "protocol",
			OldValue: oldService.Protocol,
			NewValue: body.Protocol,
		})
	}
	if oldService.Health != body.Health {
		changes = append(changes, models.ActivityChange{
			Field:    "health",
			OldValue: string(oldService.Health),
			NewValue: string(body.Health),
		})
	}

	// Create activity log if there were changes
	if len(changes) > 0 {
		go CreateActivityLog(
			models.ActivityEntityService,
			body.ID,
			body.Name,
			models.ActivityActionUpdated,
			changes,
			userID,
			userName,
		)
	}

	// Create notification for critical status changes
	if oldService.Status != body.Status && (body.Status == models.ServiceStatusError || body.Status == models.ServiceStatusStopped) {
		go createNotificationForAllUsers(
			models.NotificationTypeService,
			models.SeverityCritical,
			fmt.Sprintf("Service %s status changed to %s", body.Name, string(body.Status)),
			fmt.Sprintf("Service %s (ID: %s) status changed from %s to %s", body.Name, body.ID, string(oldService.Status), string(body.Status)),
			fmt.Sprintf(`{"serviceId":"%s","oldStatus":"%s","newStatus":"%s"}`, body.ID, string(oldService.Status), string(body.Status)),
		)
	}

	return nil
}

// DeleteService deletes a service
func DeleteService(serviceID string, userID string, userName string) error {
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

	// Get service name before deletion
	var serviceName string
	err = tx.GetContext(ctx, &serviceName, "SELECT name FROM devices.service WHERE id = $1", serviceID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("Service not found")
		}
		return err
	}

	// Delete service
	result, err := tx.ExecContext(ctx, "DELETE FROM devices.service WHERE id = $1", serviceID)
	if err != nil {
		err = errors.New("Failed to delete service")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Service not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	// Create activity log after successful deletion
	go CreateActivityLog(
		models.ActivityEntityService,
		serviceID,
		serviceName,
		models.ActivityActionDeleted,
		[]models.ActivityChange{},
		userID,
		userName,
	)

	return nil
}

// GetServicesByHostID retrieves all services for a specific host (server or VM)
func GetServicesByHostID(hostType string, hostID string, limit int, offset int) ([]models.ServiceSearchReturn, int, error) {
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
	countQuery := "SELECT COUNT(*) FROM devices.service WHERE host_type = $1 AND host_id = $2"
	err := db.GetContext(ctx, &total, countQuery, hostType, hostID)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count services: %v", err)
	}

	// Select query
	query := `
		SELECT 
			svc.*,
			COALESCE(srv.name, vm.name, '') as host_name
		FROM devices.service svc
		LEFT JOIN devices.server srv ON svc.host_type = 'SERVER' AND svc.host_id = srv.id
		LEFT JOIN devices.vm vm ON svc.host_type = 'VM' AND svc.host_id = vm.id
		WHERE svc.host_type = $1 AND svc.host_id = $2
		ORDER BY svc.name ASC
		LIMIT $3 OFFSET $4
	`

	var results []models.ServiceSearchReturn
	err = db.SelectContext(ctx, &results, query, hostType, hostID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to get services by host: %v", err)
	}

	return results, total, nil
}
