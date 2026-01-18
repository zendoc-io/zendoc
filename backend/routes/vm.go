package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func VMRoutes(r *gin.Engine) {
	vm := r.Group("/device/vm")
	vm.Use(middleware.CheckSession())
	{
		vm.GET("", handlers.SearchVMs)
		vm.GET("/:id", handlers.GetVMByID)
		vm.GET("/:id/services", handlers.GetServicesByHost)
		vm.POST("", handlers.CreateVM)
		vm.PUT("", handlers.UpdateVM)
		vm.DELETE("/:id", handlers.DeleteVM)
	}
}
