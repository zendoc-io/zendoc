package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func UserRoute(r *gin.Engine) {
	r.GET("/user/search", middleware.CheckAuth(), middleware.RequirePermissions(models.PermSearch), handlers.Search)
	r.GET("/search", middleware.CheckAuth(), middleware.RequirePermissions(models.PermSearch), handlers.GlobalSearch)
}
