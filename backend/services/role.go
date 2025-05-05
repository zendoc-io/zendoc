package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"
)

const modelInsertString = "INSERT INTO auth.roles (id, name, description) VALUES ($1, $2, $3);"

const upsertUserRoleQuery = `INSERT INTO auth.user_roles (user_id, role_id, created_at, updated_at) VALUES ($1, $2, $3, $3);`

func Roles() ([]models.Role, error) {

	db := DB
	var err error
	var data []models.Role
	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return data, fmt.Errorf("Transaction failed %v!", err.Error())
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	var roles []models.Role
	err = tx.Select(&roles, "select * from auth.roles")
	if err != nil {
		return data, err
	}
	if len(roles) == 0 {
		err = errors.New("No roles defined")
		return data, err
	}

	data = roles

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return data, err
	}

	return data, err
}

func CreateRole(body models.RCreateRole) error {
	db := DB
	var err error
	var ctx = context.Background()
	var uuid uuid.UUID = uuid.New()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	res, err := tx.Exec(modelInsertString, uuid.String(), body.Name, body.Description)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			err = errors.New("Role already exist!")
		}
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		err = errors.New("Inserting new user failed!")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}

func AssignRole(body models.RAssignRole) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	var roleID []uuid.UUID
	err = tx.Select(&roleID, "select id from auth.roles where id = $1", body.RoleID)
	if err != nil {
		return err
	}
	if len(roleID) == 0 {
		err = errors.New("Role doesn't exist!")
		return err
	}

	res, err := tx.Exec(upsertUserRoleQuery, body.UserID, roleID[0], time.Now())
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		err = errors.New("Inserting user role failed!")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}

func DeleteRole(body models.RDeleteRole) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	res, err := tx.Exec("DELETE FROM auth.roles WHERE id = $1;", body.RoleID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		err = errors.New("Role doesn't exist!")
		return err
	}
	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}
	return err
}

func UnassignRole(body models.RAssignRole) error {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	res, err := tx.Exec("DELETE FROM auth.user_roles WHERE user_id = $1 and role_id = $2;", body.UserID, body.RoleID)
	if err != nil {
		return err
	}
	rowsAffected, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rowsAffected == 0 {
		err = errors.New("Deleting user role failed!")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}
	return err
}
