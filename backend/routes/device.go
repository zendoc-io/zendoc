package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func DeviceRoutes(r *gin.Engine) {
	r.PUT("/device/role/create", middleware.CheckSession(), handlers.CreateDeviceRole)
	r.PUT("/device/role/assign", middleware.CheckSession(), handlers.AssignDeviceRole)
}
