package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

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
