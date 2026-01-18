package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var requestBody models.RUserRegister
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}
	err := services.RegisterUser(requestBody)
	if err != nil {
		switch err.Error() {
		case "User already exists!":
			c.JSON(http.StatusConflict, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}
	c.JSON(http.StatusOK, gin.H{"status": "ok"})

	return
}
func LoginPassword(c *gin.Context) {
	var requestBody models.RUserLoginPassword
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
		return
	}

	data, err := services.LoginPasswordUser(requestBody, c.Request.UserAgent(), c.RemoteIP())
	if err != nil {
		switch err.Error() {
		case "User doesn't exist!":
			c.JSON(http.StatusForbidden, gin.H{"status": "Invalid email or password"})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Failed to encode session"})
		return
	}
	cookie := &http.Cookie{
		Name:     "session_token",
		Value:    data.RefreshToken,
		Path:     "/",
		HttpOnly: true,
		Secure:   c.Request.TLS != nil,
		Expires:  time.Now().Add(24 * time.Hour),
		SameSite: http.SameSiteLaxMode,
	}
	http.SetCookie(c.Writer, cookie)
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
func Logout(c *gin.Context) {
	cookie, err := c.Request.Cookie("session_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Session token not found"})
		return
	}
	userLogout := models.RUserLogout{
		RefreshToken: cookie.Value,
	}
	err = services.LogoutSession(userLogout)
	if err != nil {
		switch err.Error() {
		case "Session doesn't exist!":
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
		default:
			log.Printf("DB Error: %v", err.Error())
			c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		}
		return
	}
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "session_token",
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   true,
		Expires:  time.Unix(0, 0),
		SameSite: http.SameSiteLaxMode,
	})
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
func Refresh(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	data, err := services.RefreshSession(sUserId, c.Request.UserAgent(), c.Request.RemoteAddr)
	if err != nil {
		switch err.Error() {
		case "Session doesn't exist!":
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
func Me(c *gin.Context) {
	userId, exists := c.Get("userId")
	sUserId, ok := userId.(string)
	if !exists || !ok || sUserId == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	data, err := services.Me(sUserId)
	if err != nil {
		switch err.Error() {
		case "Session doesn't exist!":
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
