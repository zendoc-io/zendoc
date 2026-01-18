package main

import (
	"backend/routes"
	"backend/services"
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	r := gin.Default()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	corsConfig := cors.DefaultConfig()

	corsConfig.AllowOrigins = []string{"http://localhost:3000"}
	corsConfig.AllowCredentials = true
	r.Use(cors.New(corsConfig))

	routes.SetupRoutes(r)
	_, err = services.InitDB()
	if err != nil {
		log.Fatalf("DB init failed with %v", err)
	}

	log.Println("Gin finished starting")

	r.Run(":8080")
}
