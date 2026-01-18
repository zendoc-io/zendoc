package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
)

// GetNotifications retrieves notifications for a user with filters
func GetNotifications(userID string, params models.RGetNotifications) ([]models.Notification, int, error) {
	db := DB
	var ctx = context.Background()

	baseQuery := "FROM auth.notifications WHERE user_id = $1"
	args := []interface{}{userID}
	argPos := 2

	// Filter by read/unread
	if params.Unread != "" {
		if params.Unread == "true" {
			baseQuery += " AND is_read = false"
		} else if params.Unread == "false" {
			baseQuery += " AND is_read = true"
		}
	}

	// Filter by type
	if params.Type != "" {
		baseQuery += fmt.Sprintf(" AND type = $%d", argPos)
		args = append(args, params.Type)
		argPos++
	}

	// Count total results
	countQuery := "SELECT COUNT(*) " + baseQuery
	var total int
	err := db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to count notifications: %v", err)
	}

	// Build select query
	selectQuery := "SELECT * " + baseQuery + " ORDER BY created_at DESC"

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
	var results []models.Notification
	err = db.SelectContext(ctx, &results, selectQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("Failed to get notifications: %v", err)
	}

	return results, total, nil
}

// CreateNotification creates a new notification
func CreateNotification(body models.RCreateNotification) error {
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

	query := `
		INSERT INTO auth.notifications (user_id, type, title, message, metadata)
		VALUES ($1, $2, $3, $4, $5)
	`

	_, err = tx.ExecContext(ctx, query,
		body.UserID,
		body.Type,
		body.Title,
		body.Message,
		body.Metadata,
	)

	if err != nil {
		err = errors.New("Failed to create notification")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// MarkAsRead marks a notification as read
func MarkNotificationAsRead(notificationID, userID string) error {
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

	query := "UPDATE auth.notifications SET is_read = true WHERE id = $1 AND user_id = $2"
	result, err := tx.ExecContext(ctx, query, notificationID, userID)
	if err != nil {
		err = errors.New("Failed to mark notification as read")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Notification not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// MarkAllAsRead marks all notifications as read for a user
func MarkAllNotificationsAsRead(userID string) error {
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

	query := "UPDATE auth.notifications SET is_read = true WHERE user_id = $1 AND is_read = false"
	_, err = tx.ExecContext(ctx, query, userID)
	if err != nil {
		err = errors.New("Failed to mark notifications as read")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// DeleteNotification deletes a notification
func DeleteNotification(notificationID, userID string) error {
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

	query := "DELETE FROM auth.notifications WHERE id = $1 AND user_id = $2"
	result, err := tx.ExecContext(ctx, query, notificationID, userID)
	if err != nil {
		err = errors.New("Failed to delete notification")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Notification not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}

// GetUnreadCount returns the count of unread notifications for a user
func GetUnreadNotificationCount(userID string) (int, error) {
	db := DB
	var ctx = context.Background()

	var count int
	err := db.GetContext(ctx, &count, "SELECT COUNT(*) FROM auth.notifications WHERE user_id = $1 AND is_read = false", userID)
	if err != nil {
		return 0, fmt.Errorf("Failed to get unread count: %v", err)
	}

	return count, nil
}
