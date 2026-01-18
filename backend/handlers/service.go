package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SearchServices handles GET /device/service
func SearchServices(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var params models.RSearchServices
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid query parameters"})
		return
	}

	servs, total, err := services.SearchServices(params)
	if err != nil {
		log.Printf("SearchServices error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": servs, "total": total})
}

// GetServiceByID handles GET /device/service/:id
func GetServiceByID(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	serviceID := c.Param("id")
	if serviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Service ID required"})
		return
	}

	service, err := services.GetServiceByID(serviceID)
	if err != nil {
		if err.Error() == "Service not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("GetServiceByID error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": service})
}

// CreateService handles POST /device/service
func CreateService(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	// Get user name for activity logging
	userName, _ := services.GetUserName(sUserID)

	var requestBody models.RCreateService
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.CreateService(requestBody, sUserID, userName)
	if err != nil {
		switch err.Error() {
		case "Host not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("CreateService error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "ok"})
}

// UpdateService handles PUT /device/service
func UpdateService(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	// Get user name for activity logging
	userName, _ := services.GetUserName(sUserID)

	var requestBody models.RUpdateService
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.UpdateService(requestBody, sUserID, userName)
	if err != nil {
		switch err.Error() {
		case "Service not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("UpdateService error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// DeleteService handles DELETE /device/service/:id
func DeleteService(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	// Get user name for activity logging
	userName, _ := services.GetUserName(sUserID)

	serviceID := c.Param("id")
	if serviceID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Service ID required"})
		return
	}

	err := services.DeleteService(serviceID, sUserID, userName)
	if err != nil {
		if err.Error() == "Service not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("DeleteService error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetServicesByHost handles GET /device/server/:id/services and GET /device/vm/:id/services
func GetServicesByHost(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	hostType := c.Query("hostType")
	hostID := c.Param("id")
	if hostID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Host ID required"})
		return
	}
	if hostType == "" {
		hostType = "SERVER" // Default to server
	}

	limit := 50
	offset := 0
	if l := c.Query("limit"); l != "" {
		if val, err := strconv.Atoi(l); err == nil && val > 0 {
			limit = val
		}
	}
	if o := c.Query("offset"); o != "" {
		if val, err := strconv.Atoi(o); err == nil && val >= 0 {
			offset = val
		}
	}

	servs, total, err := services.GetServicesByHostID(hostType, hostID, limit, offset)
	if err != nil {
		log.Printf("GetServicesByHost error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": servs, "total": total})
}
