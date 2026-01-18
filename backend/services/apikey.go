package services

import (
	"backend/models"
	"context"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
)

// GetAPIKeys retrieves all API keys for a user
func GetAPIKeys(userID string) ([]models.APIKeyReturn, error) {
	db := DB
	var ctx = context.Background()

	query := "SELECT * FROM auth.api_keys WHERE user_id = $1 ORDER BY created_at DESC"

	var keys []models.APIKey
	err := db.SelectContext(ctx, &keys, query, userID)
	if err != nil {
		return nil, fmt.Errorf("Failed to get API keys: %v", err)
	}

	// Convert to return format with masked keys
	var results []models.APIKeyReturn
	for _, key := range keys {
		masked := key.KeyPrefix + "_•••••••••••" + key.KeyPrefix[len(key.KeyPrefix)-4:]
		results = append(results, models.APIKeyReturn{
			ID:          key.ID,
			Name:        key.Name,
			MaskedKey:   masked,
			Permissions: key.Permissions,
			LastUsedAt:  key.LastUsedAt,
			ExpiresAt:   key.ExpiresAt,
			CreatedAt:   key.CreatedAt,
		})
	}

	return results, nil
}

// CreateAPIKey creates a new API key and returns the plain key (shown only once)
func CreateAPIKey(body models.RCreateAPIKey, userID string) (string, error) {
	db := DB
	var err error
	var ctx = context.Background()

	tx, err := db.BeginTxx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return "", fmt.Errorf("Transaction failed: %v", err)
	}

	defer func() {
		if p := recover(); p != nil {
			tx.Rollback()
			panic(p)
		} else if err != nil {
			tx.Rollback()
		}
	}()

	// Generate random key
	keyBytes := make([]byte, 32)
	_, err = rand.Read(keyBytes)
	if err != nil {
		err = errors.New("Failed to generate key")
		return "", err
	}

	plainKey := base64.URLEncoding.EncodeToString(keyBytes)
	plainKey = strings.TrimRight(plainKey, "=")

	// Determine prefix based on environment (sk_live_ or sk_test_)
	prefix := "sk_live_" + plainKey[:8]
	fullKey := prefix + plainKey[8:]

	// Hash the key
	keyHash, err := Hash256(fullKey)
	if err != nil {
		err = errors.New("Failed to hash key")
		return "", err
	}

	// Convert permissions to JSON
	permissionsJSON, err := json.Marshal(body.Permissions)
	if err != nil {
		err = errors.New("Invalid permissions format")
		return "", err
	}

	// Insert API key
	query := `
		INSERT INTO auth.api_keys (user_id, name, key_hash, key_prefix, permissions, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`

	_, err = tx.ExecContext(ctx, query,
		userID,
		body.Name,
		keyHash,
		prefix,
		string(permissionsJSON),
		body.ExpiresAt,
	)

	if err != nil {
		err = errors.New("Failed to create API key")
		return "", err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return "", err
	}

	return fullKey, nil
}

// RevokeAPIKey deletes an API key
func RevokeAPIKey(keyID, userID string) error {
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

	// Delete API key (ensure it belongs to user)
	query := "DELETE FROM auth.api_keys WHERE id = $1 AND user_id = $2"
	result, err := tx.ExecContext(ctx, query, keyID, userID)
	if err != nil {
		err = errors.New("Failed to revoke API key")
		return err
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		err = errors.New("API key not found")
		return err
	}

	if err = tx.Commit(); err != nil {
		err = errors.New("Transaction commit failed")
		return err
	}

	return nil
}
