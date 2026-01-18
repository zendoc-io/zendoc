package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func ActivityRoutes(r *gin.Engine) {
	r.GET("/activity", middleware.CheckSession(), handlers.SearchActivity)
	r.GET("/activity/recent", middleware.CheckSession(), handlers.GetRecentActivity)
}
