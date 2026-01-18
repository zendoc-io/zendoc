package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strconv"
	"strings"
)

// FilterOption represents a simple id/name option for filters
type FilterOption struct {
	ID   string `db:"id" json:"id"`
	Name string `db:"name" json:"name"`
}

// GetOSOptions retrieves all available OS options for filtering
func GetOSOptions() ([]FilterOption, error) {
	db := DB
	var ctx = context.Background()

	query := "SELECT id, name FROM devices.os ORDER BY name ASC"
	var results []FilterOption
	err := db.SelectContext(ctx, &results, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get OS options: %v", err)
	}
	return results, nil
}

// GetSubnetOptions retrieves all available subnet options for filtering
func GetSubnetOptions() ([]FilterOption, error) {
	db := DB
	var ctx = context.Background()

	query := "SELECT id, name FROM devices.subnet ORDER BY name ASC"
	var results []FilterOption
	err := db.SelectContext(ctx, &results, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get subnet options: %v", err)
	}
	return results, nil
}

// GetServerOptions retrieves all available server options for filtering (used for host selection)
func GetServerOptions() ([]FilterOption, error) {
	db := DB
	var ctx = context.Background()

	query := "SELECT id, name FROM devices.server ORDER BY name ASC"
	var results []FilterOption
	err := db.SelectContext(ctx, &results, query)
	if err != nil {
		return nil, fmt.Errorf("Failed to get server options: %v", err)
	}
	return results, nil
}

var searchDeviceQuery = ` 
SELECT
    s.id AS id,
    s.name AS name,
    s.status AS status,
    s.ip::text AS ip,
    json_build_object(
        'id', su.id,
        'name', su.name,
        'mask', su.mask,
        'gateway', su.gateway::text,
        'dns', su.dns::text,
        'created_at', su.created_at,
        'updated_at', su.updated_at,
        'created_by', su.created_by,
        'updated_by', su.updated_by
    ) AS subnet,
    json_build_object(
        'id', o.id,
        'name', o.name,
        'description', o.description,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'created_by', o.created_by,
        'updated_by', o.updated_by,
        'icon', json_build_object(
            'id', i.id,
            'url', i.url,
            'created_at', i.created_at,
            'updated_at', i.updated_at,
            'created_by', i.created_by,
            'updated_by', i.updated_by
        )
    ) AS os,
    s.created_at AS created_at,
    s.updated_at AS updated_at,
    s.created_by AS created_by,
    s.updated_by AS updated_by
FROM
    devices.server AS s
JOIN
    devices.subnet AS su ON s.subnet_id = su.id
JOIN
    devices.os AS o ON s.os_id = o.id
LEFT JOIN
    devices.icon AS i ON o.icon_id = i.id
`

func SearchDevices(params models.RSearchDevices) ([]models.DeviceSearchReturn, error) {
	db := DB
	var err error
	var deviceSearchReturn []models.DeviceSearchReturn

	conditions := []string{}
	args := []interface{}{}
	argCounter := 1

	if params.Name != "" {
		conditions = append(conditions, fmt.Sprintf("s.name ILIKE $%d", argCounter))
		args = append(args, "%"+params.Name+"%")
		argCounter++
	}
	if params.Status != "" {
		conditions = append(conditions, fmt.Sprintf("s.status = $%d", argCounter))
		args = append(args, string(params.Status))
		argCounter++
	}
	if params.IP != "" {
		conditions = append(conditions, fmt.Sprintf("s.ip::text = $%d", argCounter))
		args = append(args, params.IP)
		argCounter++
	}
	if params.Subnet != "" {
		conditions = append(conditions, fmt.Sprintf("su.name ILIKE $%d", argCounter))
		args = append(args, "%"+params.Subnet+"%")
		argCounter++
	}
	if params.Os != "" {
		conditions = append(conditions, fmt.Sprintf("o.name ILIKE $%d", argCounter))
		args = append(args, "%"+params.Os+"%")
		argCounter++
	}

	fullQuery := searchDeviceQuery
	if len(conditions) > 0 {
		fullQuery += " WHERE " + strings.Join(conditions, " AND ")
	}

	fullQuery += " ORDER BY s.name ASC"

	if params.Limit != "" {
		iLimit, err := strconv.Atoi(params.Limit)
		if (err != nil) || iLimit <= 0 {
			err = errors.New("Invalid limit!")
			return deviceSearchReturn, err
		}
		fullQuery += " LIMIT " + params.Limit
	}

	if params.Offset != "" {
		iOffset, err := strconv.Atoi(params.Offset)
		if (err != nil) || iOffset < 0 {
			err = errors.New("Invalid offset!")
			return deviceSearchReturn, err
		}
		fullQuery += " OFFSET " + params.Offset
	}

	err = db.Select(&deviceSearchReturn, fullQuery, args...)
	if err != nil {
		return nil, err
	}

	return deviceSearchReturn, err
}

func CreateDeviceRole(body models.RCreateDeviceRole, userId string) error {
	db := DB
	var err error

	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed %v!", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec("INSERT INTO devices.role (name, description, created_by, updated_by) VALUES ($1, $2, $3, $3)", body.Name, body.Description, userId)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			err = errors.New("Role already exist!")
		}
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}

func AssignDeviceRole(body models.RAssignDeviceRole) error {
	db := DB
	var err error

	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed %v!", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	_, err = tx.Exec("INSERT INTO devices.server_role (role_id, server_id) VALUES ($1, $2)", body.RoleID, body.ServerID)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			err = errors.New("Role already assigned!")
		}
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}

func CreateDeviceServer(body models.RCreateDeviceServer, userId string, userName string) error {
	db := DB
	var err error

	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed %v!", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	var serverID string
	err = tx.QueryRowContext(ctx, "INSERT INTO devices.server (name, status, ip, subnet_id, os_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6) RETURNING id", body.Name, body.Status, body.IP, body.SubnetID, body.OsID, userId).Scan(&serverID)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			err = errors.New("This device IP is already registered in this subnet!")
		}
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	// Create activity log after successful commit
	go CreateActivityLog(
		models.ActivityEntityServer,
		serverID,
		body.Name,
		models.ActivityActionCreated,
		[]models.ActivityChange{},
		userId,
		userName,
	)

	return err
}

func UpdateDeviceServer(body models.RUpdateDeviceServer, userId string, userName string) error {
	db := DB
	var err error

	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("Transaction failed %v!", err.Error())
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
	var oldServer struct {
		Name     string              `db:"name"`
		Status   models.ServerStatus `db:"status"`
		IP       string              `db:"ip"`
		SubnetID string              `db:"subnet_id"`
		OsID     string              `db:"os_id"`
	}
	err = tx.GetContext(ctx, &oldServer, "SELECT name, status, ip::text, subnet_id, os_id FROM devices.server WHERE id = $1", body.ServerID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("Server not found")
		}
		return err
	}

	_, err = tx.Exec("UPDATE devices.server SET name=$1, status=$2, ip=$3, subnet_id=$4, os_id=$5, updated_by=$6 WHERE id=$7", body.Name, body.Status, body.IP, body.SubnetID, body.OsID, userId, body.ServerID)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			err = errors.New("This device IP is already registered in this subnet!")
		}
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	// Track changes
	changes := []models.ActivityChange{}
	if oldServer.Name != body.Name {
		changes = append(changes, models.ActivityChange{
			Field:    "name",
			OldValue: oldServer.Name,
			NewValue: body.Name,
		})
	}
	if oldServer.Status != body.Status {
		changes = append(changes, models.ActivityChange{
			Field:    "status",
			OldValue: string(oldServer.Status),
			NewValue: string(body.Status),
		})
	}
	if oldServer.IP != body.IP {
		changes = append(changes, models.ActivityChange{
			Field:    "ip",
			OldValue: oldServer.IP,
			NewValue: body.IP,
		})
	}
	if oldServer.SubnetID != body.SubnetID {
		changes = append(changes, models.ActivityChange{
			Field:    "subnet_id",
			OldValue: oldServer.SubnetID,
			NewValue: body.SubnetID,
		})
	}
	if oldServer.OsID != body.OsID {
		changes = append(changes, models.ActivityChange{
			Field:    "os_id",
			OldValue: oldServer.OsID,
			NewValue: body.OsID,
		})
	}

	// Create activity log if there were changes
	if len(changes) > 0 {
		go CreateActivityLog(
			models.ActivityEntityServer,
			body.ServerID,
			body.Name,
			models.ActivityActionUpdated,
			changes,
			userId,
			userName,
		)
	}

	// Create notification for critical status changes
	if oldServer.Status != body.Status && (body.Status == models.ServerStatusInactive || body.Status == models.ServerStatusDecommissioned) {
		go createNotificationForAllUsers(
			models.NotificationTypeServer,
			models.SeverityCritical,
			fmt.Sprintf("Server %s status changed to %s", body.Name, string(body.Status)),
			fmt.Sprintf("Server %s (ID: %s) status changed from %s to %s", body.Name, body.ServerID, string(oldServer.Status), string(body.Status)),
			fmt.Sprintf(`{"serverId":"%s","oldStatus":"%s","newStatus":"%s"}`, body.ServerID, string(oldServer.Status), string(body.Status)),
		)
	}

	return err
}

// GetServerByID retrieves a single server by ID
func GetServerByID(serverID string) (models.DeviceSearchReturn, error) {
	db := DB
	var ctx = context.Background()
	var server models.DeviceSearchReturn

	query := searchDeviceQuery + " WHERE s.id = $1"

	err := db.GetContext(ctx, &server, query, serverID)
	if err != nil {
		if err == sql.ErrNoRows {
			return server, errors.New("Server not found")
		}
		return server, fmt.Errorf("Failed to get server: %v", err)
	}

	return server, nil
}

// createNotificationForAllUsers creates a notification for all users in the system
func createNotificationForAllUsers(notifType models.NotificationType, severity models.NotificationSeverity, title, message, metadata string) {
	db := DB
	var ctx = context.Background()

	// Get all user IDs
	var userIDs []string
	err := db.SelectContext(ctx, &userIDs, "SELECT id FROM auth.users")
	if err != nil {
		// Log error but don't fail the main operation
		fmt.Printf("Failed to get users for notification: %v\n", err)
		return
	}

	// Create notification for each user
	for _, userID := range userIDs {
		_ = CreateNotification(models.RCreateNotification{
			UserID:   userID,
			Type:     notifType,
			Severity: severity,
			Title:    title,
			Message:  message,
			Metadata: metadata,
		})
	}
}

// DeleteDeviceServer deletes a server by ID
func DeleteDeviceServer(serverID string, userId string, userName string) error {
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

	// Get server name before deletion
	var serverName string
	err = tx.GetContext(ctx, &serverName, "SELECT name FROM devices.server WHERE id = $1", serverID)
	if err != nil {
		if err == sql.ErrNoRows {
			err = errors.New("Server not found")
		}
		return err
	}

	// Check if server has VMs (ON DELETE RESTRICT)
	var vmCount int
	err = tx.GetContext(ctx, &vmCount, "SELECT COUNT(*) FROM devices.vm WHERE host_server_id = $1", serverID)
	if err != nil {
		return fmt.Errorf("Failed to check VMs: %v", err)
	}
	if vmCount > 0 {
		err = errors.New("Cannot delete server with existing VMs")
		return err
	}

	// Delete server (CASCADE will handle server_role and server_document)
	result, err := tx.ExecContext(ctx, "DELETE FROM devices.server WHERE id = $1", serverID)
	if err != nil {
		return fmt.Errorf("Failed to delete server: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Server not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	// Create activity log after successful deletion
	go CreateActivityLog(
		models.ActivityEntityServer,
		serverID,
		serverName,
		models.ActivityActionDeleted,
		[]models.ActivityChange{},
		userId,
		userName,
	)

	return nil
}
