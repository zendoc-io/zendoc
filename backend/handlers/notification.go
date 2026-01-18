package handlers

import (
	"backend/models"
	"backend/services"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetNotifications handles GET /user/notifications
func GetNotifications(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	var params models.RGetNotifications
	if err := c.ShouldBindQuery(&params); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid query parameters"})
		return
	}

	notifications, total, err := services.GetNotifications(sUserID, params)
	if err != nil {
		log.Printf("GetNotifications error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": notifications, "total": total})
}

// GetUnreadCount handles GET /user/notifications/unread-count
func GetUnreadCount(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	count, err := services.GetUnreadNotificationCount(sUserID)
	if err != nil {
		log.Printf("GetUnreadCount error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok", "data": gin.H{"count": count}})
}

// MarkAsRead handles POST /user/notifications/:id/read
func MarkNotificationAsRead(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	notificationID := c.Param("id")
	if notificationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Notification ID required"})
		return
	}

	err := services.MarkNotificationAsRead(notificationID, sUserID)
	if err != nil {
		if err.Error() == "Notification not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("MarkAsRead error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// MarkAllAsRead handles POST /user/notifications/read-all
func MarkAllNotificationsAsRead(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	err := services.MarkAllNotificationsAsRead(sUserID)
	if err != nil {
		log.Printf("MarkAllAsRead error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}

// DeleteNotification handles DELETE /user/notifications/:id
func DeleteNotification(c *gin.Context) {
	userID, exists := c.Get("userId")
	sUserID, ok := userID.(string)
	if !exists || !ok || sUserID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "Unauthorized"})
		return
	}

	notificationID := c.Param("id")
	if notificationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "Notification ID required"})
		return
	}

	err := services.DeleteNotification(notificationID, sUserID)
	if err != nil {
		if err.Error() == "Notification not found" {
			c.JSON(http.StatusNotFound, gin.H{"status": err.Error()})
			return
		}
		log.Printf("DeleteNotification error: %v", err.Error())
		c.JSON(http.StatusInternalServerError, gin.H{"status": "Something went wrong!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
