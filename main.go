package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	engine := gin.New()
	/*
		engine.GET("/test", func(c *gin.Context) {
			c.JSON(200, gin.H{"message": "Hello, world!"})
			return
		})
	*/
	engine.Run(":3000")
}
