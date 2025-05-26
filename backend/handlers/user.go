package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Search(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	var requestBody models.RUserSearch
	if err := c.ShouldBindQuery(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	data, err := services.UserSearch(requestBody)
	if err != nil {
		switch err.Error() {
		case "No users found!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": data})
	return
}
