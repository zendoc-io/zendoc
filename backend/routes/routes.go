package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	AuthRoutes(r)
	RoleRoute(r)
	r.GET("/hello", handlers.Hello)
}
