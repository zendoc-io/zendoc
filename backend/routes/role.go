package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func RoleRoute(r *gin.Engine) {
	r.GET("/role", middleware.CheckSession(), handlers.Roles)
	r.POST("/role/create", middleware.CheckSession(), handlers.Create)
	r.POST("/role/assign", middleware.CheckSession(), handlers.Assign)
	r.POST("/role/unassign", middleware.CheckSession(), handlers.Unassign)
	r.DELETE("/role/delete", middleware.CheckSession(), handlers.Delete)
}
