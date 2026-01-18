package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
)

var insertUsersString = "INSERT INTO auth.users (id, email, password, firstname, lastname, organization, type) VALUES ($1, $2, $3, $4, $5, $6, $7);"
var insertSessionString = "INSERT INTO auth.sessions (user_id, refresh_token, user_agent, ip, expires_at) VALUES ($1, $2, $3, $4, $5);"

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

	encEmail, err := Encrypt(body.Email)
	hashPassword, err := Hash256(body.Password)

	if err != nil {
		err = errors.New("Encryption failed!")
		return err
	}

	err = tx.Select(&ids, "SELECT id FROM auth.users WHERE email = $1", encEmail)
	if len(ids) > 0 {
		err = errors.New("User already exists!")
		return err
	}

	res, err := tx.Exec(insertUsersString, uuid, encEmail, hashPassword, body.Firstname, body.Lastname, body.Organization, body.Utype)
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

func LoginPasswordUser(body models.RUserLoginPassword, userAgent string, ip string) (models.USesssion, error) {
	db := DB
	var err error
	var data models.USesssion

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

	var ids []string
	encEmail, err := Encrypt(body.Email)
	hashPassword, err := Hash256(body.Password)

	if err != nil {
		err = errors.New("Encryption failed!")
		return data, err
	}
	err = tx.Select(&ids, "select id from auth.users where email = $1 and password = $2", encEmail, hashPassword)
	if err != nil {
		return data, err
	}
	if len(ids) == 0 || len(ids) > 1 {
		err = errors.New("User doesn't exist!")
		return data, err
	}

	var sessIds []string
	err = tx.Select(&sessIds, "select id from auth.sessions where user_id = $1", ids[0])
	if err != nil {
		return data, err
	}
	if len(sessIds) > 0 {
		_, err := tx.Exec("delete from auth.sessions where user_id = $1", ids[0])
		if err != nil {
			return data, err
		}
	}

	expiresAt := time.Now().AddDate(0, 0, 7)
	refreshToken, err := GenerateKey()
	res, err := tx.Exec(insertSessionString, ids[0], refreshToken, userAgent, ip, expiresAt)
	if err != nil {
		err = errors.New("Creating session failed!")
		return data, err
	}
	rows, err := res.RowsAffected()
	if rows == 0 {
		err = errors.New("Creating session succeded but no rows were inserted")
		return data, err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return data, err
	}

	data = models.USesssion{
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}

	return data, err
}

func LogoutSession(body models.RUserLogout) error {
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

	res, err := tx.Exec("delete from auth.sessions where refresh_token = $1", body.RefreshToken)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		err = errors.New("Session doesn't exist!")
		return err
	}
	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return err
	}

	return err
}

func RefreshSession(uID string, userAgent string, ip string) (models.USesssion, error) {
	db := DB
	var err error
	var data models.USesssion

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

	res, err := tx.Exec("delete from auth.sessions where user_id = $1", uID)
	if err != nil {
		return data, err
	}
	rowsAffected, err := res.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Session deletion failed!")
		return data, err
	}

	expiresAt := time.Now().AddDate(0, 0, 7)
	refreshToken, err := GenerateKey()
	res, err = tx.Exec(insertSessionString, uID, refreshToken, userAgent, ip, expiresAt)
	if err != nil {
		log.Printf("ERROR: %s", err)
		err = errors.New("Creating session failed!")
		return data, err
	}
	rowsAffected, err = res.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("Creating session succeded but no rows were affected!")
		return data, err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return data, err
	}

	data = models.USesssion{
		RefreshToken: refreshToken,
		ExpiresAt:    expiresAt,
	}

	return data, err
}

func Me(uID string) (models.User, error) {
	db := DB
	var err error
	var data models.User

	var ctx = context.Background()
	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  true,
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

	var uInformation []models.User

	err = tx.Select(&uInformation, "select * from auth.users where id = $1", uID)
	if err != nil {
		return data, err
	}
	if len(uInformation) == 0 || len(uInformation) > 1 {
		err = errors.New("User doesn't exist!")
		return data, err
	}

	uInformation[0].Email, err = Decrypt(uInformation[0].Email)
	if err != nil {
		return data, err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return data, err
	}

	return uInformation[0], err
}
