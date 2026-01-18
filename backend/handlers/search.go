package handlers

import (
	"backend/services"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// GlobalSearch handles GET /search
func GlobalSearch(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Search query required"})
		return
	}

	categoriesParam := c.Query("categories")
	var categories []string
	if categoriesParam != "" {
		categories = strings.Split(categoriesParam, ",")
	} else {
		// Default to all categories
		categories = []string{"servers", "vms", "services"}
	}

	results, err := services.Search(query, categories, sUserID)
	if err != nil {
		log.Printf("Search error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": results})
}
