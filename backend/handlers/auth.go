package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var requestBody models.RUserRegister
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid arguments!"})
	}
	err := services.RegisterUser(requestBody)
	if err != nil {
		switch err.Error() {
		case "User already exists!":
			c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		default:
			log.Fatalf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "hallo"})

	return
}
func Login(c *gin.Context)   {}
func Logout(c *gin.Context)  {}
func Refresh(c *gin.Context) {}
func Me(c *gin.Context)      {}
