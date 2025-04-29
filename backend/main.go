package main

import (
	"backend/routes"
	"backend/services"
	"fmt"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	corsConfig := cors.DefaultConfig()

	corsConfig.AllowOrigins = []string{"http://localhost:3000"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	routes.SetupRoutes(r)
	_, err := services.InitDB()
	if err != nil {
		log.Fatalf("DB init failed with %v", err)
	}

	fmt.Println("Gin finished starting")
	r.Run(":3001")
}
