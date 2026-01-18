package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func SearchDevices(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestParams models.RSearchDevices
	if err := c.ShouldBindQuery(&requestParams); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	data, err := services.SearchDevices(requestParams)
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

func CreateDeviceRole(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RCreateDeviceRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.CreateDeviceRole(requestBody, sUserId)

	if err != nil {
		switch err.Error() {
		case "Role already exist!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			log.Printf("DB Error: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Device role created successfully!"})
}

func AssignDeviceRole(c *gin.Context) {
	var requestBody models.RAssignDeviceRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	log.Printf("Request Body: %+v", requestBody)

	err := services.AssignDeviceRole(requestBody)
	if err != nil {
		switch err.Error() {
		case "Role already assigned!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			log.Printf("DB Error: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Server role assigned successfully!"})
}

func CreateDeviceServer(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RCreateDeviceServer
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.CreateDeviceServer(requestBody, sUserId)

	if err != nil {
		switch err.Error() {
		case "This device IP is already registerd in this subnet!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error(), "server": gin.H{"name": requestBody.Name, "status": requestBody.Status, "ip": requestBody.IP}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			log.Printf("DB Error: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Device role created successfully!"})
}

func UpdateDeviceServer(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RUpdateDeviceServer
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.UpdateDeviceServer(requestBody, sUserId)

	if err != nil {
		switch err.Error() {
		case "This device IP is already registerd in this subnet!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error(), "server": gin.H{"name": requestBody.Name, "status": requestBody.Status, "ip": requestBody.IP}})
		default:
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
			log.Printf("DB Error: %v", err.Error())
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "Server updated successfully!"})
}

// GetServerByID handles GET /device/server/:id
func GetServerByID(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	serverID := c.Param("id")
	if serverID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Server ID required"})
		return
	}

	server, err := services.GetServerByID(serverID)
	if err != nil {
		if err.Error() == "Server not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("GetServerByID error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": server})
}

// DeleteDeviceServer handles DELETE /device/server/:id
func DeleteDeviceServer(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	serverID := c.Param("id")
	if serverID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Server ID required"})
		return
	}

	err := services.DeleteDeviceServer(serverID)
	if err != nil {
		switch err.Error() {
		case "Server not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		case "Cannot delete server with existing VMs":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			log.Printf("DeleteDeviceServer error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetOSOptions handles GET /device/os
func GetOSOptions(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	options, err := services.GetOSOptions()
	if err != nil {
		log.Printf("GetOSOptions error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": options})
}

// GetSubnetOptions handles GET /device/subnet
func GetSubnetOptions(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	options, err := services.GetSubnetOptions()
	if err != nil {
		log.Printf("GetSubnetOptions error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": options})
}

// GetServerOptions handles GET /device/server/options
func GetServerOptions(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	options, err := services.GetServerOptions()
	if err != nil {
		log.Printf("GetServerOptions error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": options})
}
