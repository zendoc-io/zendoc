package handlers

import (
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetGraph retrieves the complete infrastructure graph data
func GetGraph(c *gin.Context) {
	graphData, err := services.GetInfrastructureGraph()
	if err != nil {
		log.Printf("Graph Error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Failed to get graph data!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": graphData})
}
