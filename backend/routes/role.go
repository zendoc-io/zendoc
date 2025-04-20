package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func RoleRoute(r *gin.Engine) {
	r.GET("/role", middleware.CheckSession(), handlers.Roles)
	r.POST("/role/create", middleware.CheckSession(), handlers.Create)
	// r.POST("/role/assign", handlers.AssignRole)
	// r.DELETE("/role/delete", handlers.AssignRole)
}
