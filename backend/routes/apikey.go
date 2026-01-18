package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func APIKeyRoutes(r *gin.Engine) {
	apikey := r.Group("/user/api-keys")
	apikey.Use(middleware.CheckSession()) // API key management requires session auth (not API key)
	{
		apikey.GET("", handlers.GetAPIKeys)
		apikey.GET("/permissions", handlers.GetAvailablePermissions)
		apikey.POST("", handlers.CreateAPIKey)
		apikey.DELETE("/:id", handlers.RevokeAPIKey)
	}
}
