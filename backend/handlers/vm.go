package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// SearchVMs handles GET /device/vm
func SearchVMs(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var params models.RSearchVMs
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid query parameters"})
		return
	}

	vms, total, err := services.SearchVMs(params)
	if err != nil {
		log.Printf("SearchVMs error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": vms, "total": total})
}

// GetVMByID handles GET /device/vm/:id
func GetVMByID(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	vmID := c.Param("id")
	if vmID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "VM ID required"})
		return
	}

	vm, err := services.GetVMByID(vmID)
	if err != nil {
		if err.Error() == "VM not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("GetVMByID error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": vm})
}

// CreateVM handles POST /device/vm
func CreateVM(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RCreateVM
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.CreateVM(requestBody, sUserID)
	if err != nil {
		switch err.Error() {
		case "Host server not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		case "OS not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("CreateVM error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}

	c.JSON(http.StatusCreated, gin.H{"status": "ok"})
}

// UpdateVM handles PUT /device/vm
func UpdateVM(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var requestBody models.RUpdateVM
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	err := services.UpdateVM(requestBody, sUserID)
	if err != nil {
		switch err.Error() {
		case "VM not found":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("UpdateVM error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// DeleteVM handles DELETE /device/vm/:id
func DeleteVM(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	vmID := c.Param("id")
	if vmID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "VM ID required"})
		return
	}

	err := services.DeleteVM(vmID)
	if err != nil {
		if err.Error() == "VM not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("DeleteVM error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// GetVMsByServer handles GET /device/server/:id/vms
func GetVMsByServer(c *gin.Context) {
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

	vms, total, err := services.GetVMsByServerID(serverID, limit, offset)
	if err != nil {
		log.Printf("GetVMsByServer error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": vms, "total": total})
}
