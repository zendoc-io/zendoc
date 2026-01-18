package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func ActivityRoutes(r *gin.Engine) {
	r.GET("/activity", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadActivity), handlers.SearchActivity)
	r.GET("/activity/recent", middleware.CheckAuth(), middleware.RequirePermissions(models.PermReadActivity), handlers.GetRecentActivity)
}
