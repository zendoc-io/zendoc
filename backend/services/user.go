package services

import (
	"backend/models"
	"context"
	"database/sql"
	"errors"
	"strings"
)

const userSearchQuery = "SELECT id, firstname, lastname, organization FROM auth.users WHERE lower(concat(firstname,' ', lastname)) LIKE $1"
const userSearchQueryWithOrg = "SELECT id, firstname, lastname, organization FROM auth.users WHERE lower(concat(firstname,' ', lastname)) LIKE $1 and organization = $2"

func UserSearch(body models.RUserSearch) ([]models.UserSearchReturn, error) {
	db := DB
	var err error
	var searchReturn []models.UserSearchReturn
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  true,
	})
	if err != nil {
		return nil, err
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	if len(body.OrganizationId) == 0 {
		err = tx.Select(&searchReturn, userSearchQuery, "%"+strings.ToLower(body.Name)+"%")
		if err != nil {
			return nil, err
		}
		if len(searchReturn) == 0 {
			err = errors.New("No users found!")
			return nil, err
		}
	} else {
		err = tx.Select(&searchReturn, userSearchQueryWithOrg, "%"+strings.ToLower(body.Name)+"%", body.OrganizationId)
		if err != nil {
			return nil, err
		}
		if len(searchReturn) == 0 {
			err = errors.New("No users found!")
			return nil, err
		}
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed!")
		return nil, err
	}
	return searchReturn, err
}

// GetUserName retrieves the user's full name by ID
func GetUserName(userID string) (string, error) {
	db := DB
	var ctx = context.Background()

	var user struct {
		Firstname string `db:"firstname"`
		Lastname  string `db:"lastname"`
	}

	err := db.GetContext(ctx, &user, "SELECT firstname, lastname FROM auth.users WHERE id = $1", userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return "Unknown User", nil
		}
		return "Unknown User", err
	}

	return user.Firstname + " " + user.Lastname, nil
}
