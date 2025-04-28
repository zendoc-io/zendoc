package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func AuthRoutes(r *gin.Engine) {
	r.POST("/auth/register", handlers.Register)
	r.POST("/auth/login/password", handlers.LoginPassword)
	r.GET("/auth/logout", handlers.Logout)
	r.GET("/auth/refresh", middleware.CheckSession(), handlers.Refresh)
	r.GET("/auth/me", middleware.CheckSession(), handlers.Me)
}
