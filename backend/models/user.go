package models

import (
	"database/sql"

	"github.com/google/uuid"
)

type UserSearchReturn struct {
	Id           uuid.UUID           `json:"id"`
	Firstname    string              `json:"firstname"`
	Lastname     string              `json:"lastname"`
	Organization sql.Null[uuid.UUID] `json:"organization"`
}
