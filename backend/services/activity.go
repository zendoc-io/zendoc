package services

import (
	"backend/models"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
)

// CreateActivityLog creates a new activity log entry
func CreateActivityLog(
	entityType models.ActivityEntityType,
	entityID string,
	entityName string,
	action models.ActivityAction,
	changes []models.ActivityChange,
	userID string,
	userName string,
) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelReadCommitted,
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

	changesJSON, err := json.Marshal(changes)
	if err != nil {
		changesJSON = []byte("[]")
	}

	query := `
		INSERT INTO devices.activity_log (
			entity_type, entity_id, entity_name, action, changes, user_id, user_name
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`

	_, err = tx.ExecContext(ctx, query, entityType, entityID, entityName, action, changesJSON, userID, userName)
	if err != nil {
		return fmt.Errorf("Failed to create activity log: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("Transaction commit failed: %v", err)
	}

	return nil
}

// SearchActivityLogs searches for activity logs with filters
func SearchActivityLogs(params models.RSearchActivity) ([]models.Activity, int, error) {
	db := DB
	var ctx = context.Background()

	baseQuery := `
		FROM devices.activity_log
		WHERE 1=1
	`

	var args []interface{}
	argPos := 1

	if params.EntityType != "" {
		baseQuery += fmt.Sprintf(" AND entity_type = $%d", argPos)
		args = append(args, params.EntityType)
		argPos++
	}

	if params.EntityID != "" {
		baseQuery += fmt.Sprintf(" AND entity_id = $%d", argPos)
		args = append(args, params.EntityID)
		argPos++
	}

	if params.Action != "" {
		baseQuery += fmt.Sprintf(" AND action = $%d", argPos)
		args = append(args, params.Action)
		argPos++
	}

	// Count total results
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int
	err := db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count activity logs: %v", err)
	}

	// Build select query
	selectQuery := "SELECT * " + baseQuery + " ORDER BY created_at DESC"

	// Add pagination
	limit := 50
	if params.Limit > 0 && params.Limit <= 100 {
		limit = params.Limit
	}
	offset := 0
	if params.Offset >= 0 {
		offset = params.Offset
	}

	selectQuery += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	var results []models.Activity
	err = db.SelectContext(ctx, &results, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to search activity logs: %v", err)
	}

	return results, total, nil
}

// GetRecentActivity gets the most recent activity across all entities
func GetRecentActivity(limit int) ([]models.Activity, error) {
	db := DB
	var ctx = context.Background()

	if limit <= 0 || limit > 50 {
		limit = 10
	}

	query := `
		SELECT * FROM devices.activity_log
		ORDER BY created_at DESC
		LIMIT $1
	`

	var results []models.Activity
	err := db.SelectContext(ctx, &results, query, limit)
	if err != nil {
		return nil, fmt.Errorf("Failed to get recent activity: %v", err)
	}

	return results, nil
}
