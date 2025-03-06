package main

import (
	"backend/routes"
	"fmt"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	routes.SetupRoutes(r)

	fmt.Println("Gin finished starting")
	r.Run(":3000")
}
