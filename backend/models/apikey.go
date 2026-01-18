package models

import (
	"database/sql"
	"time"
)

type APIKey struct {
	ID          string       `db:"id" json:"id"`
	UserID      string       `db:"user_id" json:"userId"`
	Name        string       `db:"name" json:"name"`
	KeyHash     string       `db:"key_hash" json:"-"` // Never expose hash
	KeyPrefix   string       `db:"key_prefix" json:"keyPrefix"`
	Permissions string       `db:"permissions" json:"permissions"` // JSONB as string
	LastUsedAt  sql.NullTime `db:"last_used_at" json:"lastUsedAt,omitempty"`
	ExpiresAt   sql.NullTime `db:"expires_at" json:"expiresAt,omitempty"`
	CreatedAt   time.Time    `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time    `db:"updated_at" json:"updatedAt"`
}

// APIKeyReturn is what we return to frontend (with masked key)
type APIKeyReturn struct {
	ID          string       `json:"id"`
	Name        string       `json:"name"`
	MaskedKey   string       `json:"maskedKey"`
	Permissions string       `json:"permissions"`
	LastUsedAt  sql.NullTime `json:"lastUsedAt,omitempty"`
	ExpiresAt   sql.NullTime `json:"expiresAt,omitempty"`
	CreatedAt   time.Time    `json:"createdAt"`
}

// Request types

type RCreateAPIKey struct {
	Name          string   `json:"name" binding:"required"`
	Permissions   []string `json:"permissions"`
	ExpiresInDays *int     `json:"expiresInDays"` // Optional: 30, 60, 90, 120, or null
	ExpiresAt     *string  `json:"expiresAt"`     // Computed from ExpiresInDays
}

type RRevokeAPIKey struct {
	ID string `json:"id" binding:"required"`
}
