package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func RoleRoute(r *gin.Engine) {
	r.GET("/role", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadRoles), handlers.Roles)
	r.POST("/role/create", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteRoles), handlers.Create)
	r.POST("/role/assign", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteRoles), handlers.Assign)
	r.POST("/role/unassign", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteRoles), handlers.Unassign)
	r.DELETE("/role/delete", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteRoles), handlers.Delete)
}
