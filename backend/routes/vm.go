package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func VMRoutes(r *gin.Engine) {
	vm := r.Group("/device/vm")
	vm.Use(middleware.CheckAuth())
	{
		vm.GET("", middleware.RequirePermissions(models.PermReadVMs), handlers.SearchVMs)
		vm.GET("/:id", middleware.RequirePermissions(models.PermReadVMs), handlers.GetVMByID)
		vm.GET("/:id/services", middleware.RequirePermissions(models.PermReadVMs), handlers.GetServicesByHost)
		vm.POST("", middleware.RequirePermissions(models.PermWriteVMs), handlers.CreateVM)
		vm.PUT("", middleware.RequirePermissions(models.PermWriteVMs), handlers.UpdateVM)
		vm.DELETE("/:id", middleware.RequirePermissions(models.PermDeleteVMs), handlers.DeleteVM)
	}
}
