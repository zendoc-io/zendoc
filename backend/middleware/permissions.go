package middleware

import (
	"backend/models"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
)

// RequirePermissions checks if user has required permission(s)
// For session auth, always allows (assumes user has full access)
// For API key auth, checks permissions in API key
func RequirePermissions(required ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authMethod, exists := c.Get("authMethod")

		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{
				"status": "Authentication required",
			})
			c.Abort()
			return
		}

		// Session-based auth: full access (bypass permission check)
		if authMethod == "session" {
			c.Next()
			return
		}

		// API key auth: check permissions
		if authMethod == "apikey" {
			permissionsRaw, exists := c.Get("permissions")
			if !exists {
				c.JSON(http.StatusForbidden, gin.H{
					"status": "No permissions found for API key",
				})
				c.Abort()
				return
			}

			// Parse permissions from JSONB (stored as string in context)
			var permissions []string
			switch v := permissionsRaw.(type) {
			case string:
				if err := json.Unmarshal([]byte(v), &permissions); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{
						"status": "Failed to parse permissions",
					})
					c.Abort()
					return
				}
			case []string:
				permissions = v
			default:
				c.JSON(http.StatusInternalServerError, gin.H{
					"status": "Invalid permissions format",
				})
				c.Abort()
				return
			}

			// Check if API key has ANY of the required permissions
			hasPermission := false
			for _, req := range required {
				if models.HasPermission(permissions, req) {
					hasPermission = true
					break
				}
			}

			if !hasPermission {
				c.JSON(http.StatusForbidden, gin.H{
					"status":   "Insufficient permissions",
					"required": required,
				})
				c.Abort()
				return
			}
		}

		c.Next()
	}
}
