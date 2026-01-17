package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Roles(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	data, err := services.Roles()
	if err != nil {
		switch err.Error() {
		case "No roles defined":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": data})

	return

}

func Create(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	var requestBody models.RCreateRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	err := services.CreateRole(requestBody)
	if err != nil {
		switch err.Error() {
		case "Role already exist!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})

	return

}

func Assign(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	var requestBody models.RAssignRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	err := services.AssignRole(requestBody)
	if err != nil {
		switch err.Error() {
		case "Role doesn't exist!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		case "User already has this role!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func Delete(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	var requestBody models.RDeleteRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	err := services.DeleteRole(requestBody)
	if err != nil {
		switch err.Error() {
		case "Role doesn't exist!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

func Unassign(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}
	var requestBody models.RAssignRole
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	err := services.UnassignRole(requestBody)
	if err != nil {
		switch err.Error() {
		case "Deleting user role failed!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
