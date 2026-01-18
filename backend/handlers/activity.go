package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SearchActivity handles GET /activity
func SearchActivity(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var params models.RSearchActivity
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid query parameters"})
		return
	}

	activities, total, err := services.SearchActivityLogs(params)
	if err != nil {
		log.Printf("SearchActivity error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": activities, "total": total})
}

// GetRecentActivity handles GET /activity/recent
func GetRecentActivity(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 50 {
			limit = l
		}
	}

	activities, err := services.GetRecentActivity(limit)
	if err != nil {
		log.Printf("GetRecentActivity error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": activities})
}
