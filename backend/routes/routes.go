package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	AuthRoutes(r)
	RoleRoute(r)
	UserRoute(r)
	r.GET("/hello", handlers.Hello)
}
