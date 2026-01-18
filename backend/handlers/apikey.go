package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetAPIKeys handles GET /user/api-keys
func GetAPIKeys(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	keys, err := services.GetAPIKeys(sUserID)
	if err != nil {
		log.Printf("GetAPIKeys error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": keys})
}

// CreateAPIKey handles POST /user/api-keys
func CreateAPIKey(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RCreateAPIKey
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	plainKey, err := services.CreateAPIKey(requestBody, sUserID)
	if err != nil {
		log.Printf("CreateAPIKey error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	// Return the plain key ONCE - frontend should display it in a modal
	c.JSON(http.StatusCreated, gin.H{"status": "ok", "data": gin.H{"key": plainKey}})
}

// RevokeAPIKey handles DELETE /user/api-keys/:id
func RevokeAPIKey(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	keyID := c.Param("id")
	if keyID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "API key ID required"})
		return
	}

	err := services.RevokeAPIKey(keyID, sUserID)
	if err != nil {
		if err.Error() == "API key not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("RevokeAPIKey error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
