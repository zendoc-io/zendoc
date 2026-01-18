package models

import "time"

type Notification struct {
	ID        string               `db:"id" json:"id"`
	UserID    string               `db:"user_id" json:"userId"`
	Type      NotificationType     `db:"type" json:"type"`
	Severity  NotificationSeverity `db:"severity" json:"severity"`
	Title     string               `db:"title" json:"title"`
	Message   string               `db:"message" json:"message"`
	IsRead    bool                 `db:"is_read" json:"isRead"`
	Metadata  string               `db:"metadata" json:"metadata"` // JSONB as string
	CreatedAt time.Time            `db:"created_at" json:"createdAt"`
}

type NotificationType string

const (
	NotificationTypeServer  NotificationType = "SERVER"
	NotificationTypeVM      NotificationType = "VM"
	NotificationTypeService NotificationType = "SERVICE"
	NotificationTypeUser    NotificationType = "USER"
	NotificationTypeSystem  NotificationType = "SYSTEM"
	NotificationTypeAPI     NotificationType = "API"
)

type NotificationSeverity string

const (
	SeverityCritical NotificationSeverity = "critical"
	SeverityWarning  NotificationSeverity = "warning"
	SeverityInfo     NotificationSeverity = "info"
)

// Request types

type RCreateNotification struct {
	UserID   string               `json:"userId" binding:"required"`
	Type     NotificationType     `json:"type" binding:"required"`
	Severity NotificationSeverity `json:"severity"`
	Title    string               `json:"title" binding:"required"`
	Message  string               `json:"message" binding:"required"`
	Metadata string               `json:"metadata"`
}

type RGetNotifications struct {
	Unread string `form:"unread"`
	Type   string `form:"type"`
	Limit  string `form:"limit"`
	Offset string `form:"offset"`
}

type RMarkAsRead struct {
	ID string `json:"id" binding:"required"`
}
