package routes

import (
	"backend/handlers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(r *gin.Engine) {
	AuthRoutes(r)
	r.GET("/hello", handlers.Hello)
}
