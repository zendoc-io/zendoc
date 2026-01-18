package routes

import (
	"backend/handlers"
	"backend/middleware"

	"github.com/gin-gonic/gin"
)

func NotificationRoutes(r *gin.Engine) {
	notif := r.Group("/user/notifications")
	notif.Use(middleware.CheckSession())
	{
		notif.GET("", handlers.GetNotifications)
		notif.GET("/unread-count", handlers.GetUnreadCount)
		notif.POST("/:id/read", handlers.MarkNotificationAsRead)
		notif.POST("/read-all", handlers.MarkAllNotificationsAsRead)
		notif.DELETE("/:id", handlers.DeleteNotification)
	}
}
