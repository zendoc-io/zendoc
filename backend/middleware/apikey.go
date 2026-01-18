package middleware

import (
	"backend/services"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// CheckAPIKey validates API key from Authorization header
func CheckAPIKey() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "Missing Authorization header",
			})
			c.Abort()
			return
		}

		// Expected format: "Bearer sk_live_..."
		parts := strings.SplitN(authHeader, " ", 2)
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "Invalid Authorization header format",
			})
			c.Abort()
			return
		}

		apiKey := parts[1]

		// Hash the API key
		hash := sha256.Sum256([]byte(apiKey))
		keyHash := hex.EncodeToString(hash[:])

		// Validate API key and update last_used_at
		apiKeyRecord, err := services.ValidateAndUpdateAPIKey(keyHash)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "Invalid or expired API key",
			})
			c.Abort()
			return
		}

		// Set context variables
		c.Set("userId", apiKeyRecord.UserID)
		c.Set("apiKeyId", apiKeyRecord.ID)
		c.Set("authMethod", "apikey")
		c.Set("permissions", apiKeyRecord.Permissions) // Store for permission checks

		c.Next()
	}
}
