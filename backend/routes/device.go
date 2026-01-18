package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func DeviceRoutes(r *gin.Engine) {
	// Server routes
	r.GET("/device/server", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.SearchDevices)
	r.GET("/device/server/options", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetServerOptions)
	r.GET("/device/server/:id", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetServerByID)
	r.GET("/device/server/:id/vms", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetVMsByServer)
	r.GET("/device/server/:id/services", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetServicesByHost)
	r.POST("/device/server/create", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteDevices), handlers.CreateDeviceServer)
	r.PUT("/device/server", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteDevices), handlers.UpdateDeviceServer)
	r.DELETE("/device/server/:id", middleware.CheckAuth(), middleware.RequirePermissions(models.PermDeleteDevices), handlers.DeleteDeviceServer)

	// Device role routes
	r.POST("/device/role/create", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteDevices), handlers.CreateDeviceRole)
	r.POST("/device/role/assign", middleware.CheckAuth(), middleware.RequirePermissions(models.PermWriteDevices), handlers.AssignDeviceRole)

	// Filter options routes
	r.GET("/device/os", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetOSOptions)
	r.GET("/device/subnet", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetSubnetOptions)

	// Graph route
	r.GET("/device/graph", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadDevices), handlers.GetGraph)
}
