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

func CreateDeviceServer(body models.RCreateDeviceServer, userId string) error {
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

	_, err = tx.Exec("INSERT INTO devices.server (name, status, ip, subnet_id, os_id, created_by, updated_by) VALUES ($1, $2, $3, $4, $5, $6, $6)", body.Name, body.Status, body.IP, body.SubnetID, body.OsID, userId)
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

	return err
}

func UpdateDeviceServer(body models.RUpdateDeviceServer, userId string) error {
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

// DeleteDeviceServer deletes a server by ID
func DeleteDeviceServer(serverID string) error {
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

	return nil
}
