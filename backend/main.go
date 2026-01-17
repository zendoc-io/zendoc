package main

import (
	"backend/routes"
	"backend/services"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	r := gin.Default()

	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	routes.SetupRoutes(r)
	_, err = services.InitDB()
	if err != nil {
		log.Fatalf("DB init failed with %v", err)
	}

	log.Println("Gin finished starting")

	r.Run(":3000")
}
