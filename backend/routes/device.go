package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func DeviceRoutes(r *gin.Engine) {
	r.GET("/device/server", middleware.CheckSession(), handlers.SearchDevices)
	r.POST("/device/role/create", middleware.CheckSession(), handlers.CreateDeviceRole)
	r.POST("/device/role/assign", middleware.CheckSession(), handlers.AssignDeviceRole)
	r.POST("/device/server/create", middleware.CheckSession(), handlers.CreateDeviceServer)
	r.PUT("/device/server", middleware.CheckSession(), handlers.UpdateDeviceServer)
}
