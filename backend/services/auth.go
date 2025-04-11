package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
)

var insertString = "INSERT INTO auth.users (id, email, password, firstname, lastname, organization, type) VALUES ($1, $2, $3, $4, $5, $6, $7);"

func RegisterUser(body models.RUserRegister) error {
	db := DB
	var ids []string
	var err error
	var uuid uuid.UUID = uuid.New()

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

	err = tx.Select(&ids, "SELECT id FROM auth.users WHERE email = $1", body.Email)
	if len(ids) > 0 {
		err = errors.New("User already exists!")
		return err
	}
	res, err := tx.Exec(insertString, uuid, body.Email, body.Password, body.Firstname, body.Lastname, body.Organization, body.Utype)
	if err != nil {
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

	var roles []string
	err = tx.Select(&roles, "select id from auth.roles where name = $1", body.Role)
	if err != nil {
		return err
	}
	if len(roles) == 0 || len(roles) > 1 {
		err = errors.New("Role doesn't exists!")
		return err
	}

	res, err = tx.Exec("INSERT INTO auth.user_roles (user_id, role_id) VALUES ($1, $2);", uuid.String(), roles[0])

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}
