package main

import (
	"backend/routes"
	"backend/services"
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	routes.SetupRoutes(r)
	_, err := services.InitDB()
	if err != nil {
		log.Fatalf("DB init failed with %v", err)
	}

	fmt.Println("Gin finished starting")
	r.Run(":3000")
}
