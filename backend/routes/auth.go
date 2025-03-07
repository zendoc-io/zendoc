package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	r.POST("/auth/register", handlers.Register)
	r.POST("/auth/login", handlers.Login)
	r.GET("/auth/logout", handlers.Logout)
	r.GET("/auth/refresh", handlers.Refresh)
	r.GET("/auth/me", handlers.Me)
}
