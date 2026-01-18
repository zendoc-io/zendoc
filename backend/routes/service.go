package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ServiceRoutes(r *gin.Engine) {
	service := r.Group("/device/service")
	service.Use(middleware.CheckSession())
	{
		service.GET("", handlers.SearchServices)
		service.GET("/:id", handlers.GetServiceByID)
		service.POST("", handlers.CreateService)
		service.PUT("", handlers.UpdateService)
		service.DELETE("/:id", handlers.DeleteService)
	}
}
