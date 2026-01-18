package models

import "time"

type SystemSetting struct {
	ID          string    `db:"id" json:"id"`
	Key         string    `db:"key" json:"key"`
	Value       string    `db:"value" json:"value"` // JSONB as string
	Description string    `db:"description" json:"description"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
	UpdatedBy   string    `db:"updated_by" json:"updatedBy"`
}

type UserPreferences struct {
	UserID               string    `db:"user_id" json:"userId"`
	Theme                string    `db:"theme" json:"theme"`
	Language             string    `db:"language" json:"language"`
	EmailNotifications   bool      `db:"email_notifications" json:"emailNotifications"`
	DesktopNotifications bool      `db:"desktop_notifications" json:"desktopNotifications"`
	TablePreferences     string    `db:"table_preferences" json:"tablePreferences"` // JSONB as string
	CreatedAt            time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt            time.Time `db:"updated_at" json:"updatedAt"`
}

// Request types

type RUpdateSystemSettings struct {
	Settings map[string]interface{} `json:"settings" binding:"required"`
}

type RUpdateUserPreferences struct {
	Theme                *string                `json:"theme"`
	Language             *string                `json:"language"`
	EmailNotifications   *bool                  `json:"emailNotifications"`
	DesktopNotifications *bool                  `json:"desktopNotifications"`
	TablePreferences     map[string]interface{} `json:"tablePreferences"`
}
