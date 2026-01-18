package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func DeviceRoutes(r *gin.Engine) {
	// Server routes
	r.GET("/device/server", middleware.CheckSession(), handlers.SearchDevices)
	r.GET("/device/server/options", middleware.CheckSession(), handlers.GetServerOptions)
	r.GET("/device/server/:id", middleware.CheckSession(), handlers.GetServerByID)
	r.GET("/device/server/:id/vms", middleware.CheckSession(), handlers.GetVMsByServer)
	r.GET("/device/server/:id/services", middleware.CheckSession(), handlers.GetServicesByHost)
	r.POST("/device/server/create", middleware.CheckSession(), handlers.CreateDeviceServer)
	r.PUT("/device/server", middleware.CheckSession(), handlers.UpdateDeviceServer)
	r.DELETE("/device/server/:id", middleware.CheckSession(), handlers.DeleteDeviceServer)

	// Device role routes
	r.POST("/device/role/create", middleware.CheckSession(), handlers.CreateDeviceRole)
	r.POST("/device/role/assign", middleware.CheckSession(), handlers.AssignDeviceRole)

	// Filter options routes
	r.GET("/device/os", middleware.CheckSession(), handlers.GetOSOptions)
	r.GET("/device/subnet", middleware.CheckSession(), handlers.GetSubnetOptions)
}
