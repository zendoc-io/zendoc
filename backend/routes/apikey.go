package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func APIKeyRoutes(r *gin.Engine) {
	apikey := r.Group("/user/api-keys")
	apikey.Use(middleware.CheckSession())
	{
		apikey.GET("", handlers.GetAPIKeys)
		apikey.POST("", handlers.CreateAPIKey)
		apikey.DELETE("/:id", handlers.RevokeAPIKey)
	}
}
