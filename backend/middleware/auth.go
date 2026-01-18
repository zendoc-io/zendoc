package middleware

import (
	"backend/services"
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func CheckSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie("session_token")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"status": "Session token not found"})
			return
		}
		sessionToken := cookie.Value

		db := services.DB
		var ctx = context.Background()
		tx, err := db.BeginTxx(ctx, &sql.TxOptions{
			Isolation: sql.LevelSerializable,
			ReadOnly:  false,
		})
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
			return
		}

		defer func() {
			if p := recover(); p != nil {
				tx.Rollback()
				panic(p)
			} else if err != nil {
				tx.Rollback()
			}
		}()

		var uIDs []string
		err = tx.Select(&uIDs, "select user_id from auth.sessions where refresh_token = $1", sessionToken)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
			return
		}
		if len(uIDs) == 0 || len(uIDs) > 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
			return
		}

		if err = tx.Commit(); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
			return
		}
		c.Set("userId", uIDs[0])
		c.Set("authMethod", "session")
		c.Next()
	}
}

// CheckAuth accepts EITHER session cookie OR API key
// Tries session first, then falls back to API key
func CheckAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Try session first
		cookie, err := c.Request.Cookie("session_token")
		if err == nil {
			sessionToken := cookie.Value

			db := services.DB
			var ctx = context.Background()
			tx, err := db.BeginTxx(ctx, &sql.TxOptions{
				Isolation: sql.LevelSerializable,
				ReadOnly:  false,
			})
			if err == nil {
				defer func() {
					if p := recover(); p != nil {
						tx.Rollback()
						panic(p)
					} else if err != nil {
						tx.Rollback()
					}
				}()

				var uIDs []string
				err = tx.Select(&uIDs, "select user_id from auth.sessions where refresh_token = $1", sessionToken)
				if err == nil && len(uIDs) == 1 {
					if err = tx.Commit(); err == nil {
						c.Set("userId", uIDs[0])
						c.Set("authMethod", "session")
						c.Next()
						return
					}
				}
				tx.Rollback()
			}
		}

		// Try API key
		authHeader := c.GetHeader("Authorization")
		if authHeader != "" {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) == 2 && parts[0] == "Bearer" {
				apiKey := parts[1]
				hash := sha256.Sum256([]byte(apiKey))
				keyHash := hex.EncodeToString(hash[:])

				apiKeyRecord, err := services.ValidateAndUpdateAPIKey(keyHash)
				if err == nil {
					c.Set("userId", apiKeyRecord.UserID)
					c.Set("apiKeyId", apiKeyRecord.ID)
					c.Set("authMethod", "apikey")
					c.Set("permissions", apiKeyRecord.Permissions)
					c.Next()
					return
				}
			}
		}

		// Both failed
		c.JSON(http.StatusUnauthorized, gin.H{
			"status": "Authentication required",
		})
		c.Abort()
	}
}
