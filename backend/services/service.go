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
func CreateService(body models.RCreateService, userID string) error {
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
	`

	_, err = tx.ExecContext(ctx, query,
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
	)

	if err != nil {
		err = errors.New("Failed to create service")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// UpdateService updates an existing service
func UpdateService(body models.RUpdateService, userID string) error {
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

	return nil
}

// DeleteService deletes a service
func DeleteService(serviceID string) error {
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
