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
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
	}
	err := services.RegisterUser(requestBody)
	if err != nil {
		switch err.Error() {
		case "User already exists!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			log.Fatalf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": "hallo"})

	return
}
func LoginPassword(c *gin.Context) {
	var requestBody models.RUserLoginPassword
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid arguments!"})
	}

	data, err := services.LoginPasswordUser(requestBody, c.Request.UserAgent(), c.Request.RemoteAddr)
	if err != nil {
		switch err.Error() {
		case "User doesn't exist!":
			c.JSON(http.StatusForbidden, gin.H{"status": "Invalid email or password"})
		default:
			log.Fatalf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": data})

	return
}
func Logout(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Authorization header not found"})
		return
	}
	userLogout := models.RUserLogout{
		RefreshToken: authHeader,
	}

	err := services.LogoutSession(userLogout)
	if err != nil {
		switch err.Error() {
		case "Session doesn't exist!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Fatalf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something wen't wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})

	return

}
func Refresh(c *gin.Context) {}
func Me(c *gin.Context)      {}
