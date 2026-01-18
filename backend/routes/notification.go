package routes

import (
	"backend/handlers"
	"backend/middleware"
	"backend/models"

	"github.com/gin-gonic/gin"
)

func NotificationRoutes(r *gin.Engine) {
	notif := r.Group("/user/notifications")
	notif.Use(middleware.CheckAuth())
	{
		notif.GET("", middleware.RequirePermissions(models.PermReadNotifications), handlers.GetNotifications)
		notif.GET("/unread-count", middleware.RequirePermissions(models.PermReadNotifications), handlers.GetUnreadCount)
		notif.POST("/:id/read", middleware.RequirePermissions(models.PermWriteNotifications), handlers.MarkNotificationAsRead)
		notif.POST("/read-all", middleware.RequirePermissions(models.PermWriteNotifications), handlers.MarkAllNotificationsAsRead)
		notif.DELETE("/:id", middleware.RequirePermissions(models.PermWriteNotifications), handlers.DeleteNotification)
	}
}
