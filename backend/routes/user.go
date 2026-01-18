package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func UserRoute(r *gin.Engine) {
	r.GET("/user/search", middleware.CheckSession(), handlers.Search)
	r.GET("/search", middleware.CheckSession(), handlers.GlobalSearch)
}
