package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func ServiceRoutes(r *gin.Engine) {
	service := r.Group("/device/service")
	service.Use(middleware.CheckAuth())
	{
		service.GET("", middleware.RequirePermissions(models.PermReadServices), handlers.SearchServices)
		service.GET("/:id", middleware.RequirePermissions(models.PermReadServices), handlers.GetServiceByID)
		service.POST("", middleware.RequirePermissions(models.PermWriteServices), handlers.CreateService)
		service.PUT("", middleware.RequirePermissions(models.PermWriteServices), handlers.UpdateService)
		service.DELETE("/:id", middleware.RequirePermissions(models.PermDeleteServices), handlers.DeleteService)
	}
}
