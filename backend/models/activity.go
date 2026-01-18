package models

import (
	"time"

	"github.com/goccy/go-json"
)

// ActivityEntityType represents the type of entity an activity relates to
type ActivityEntityType string

const (
	ActivityEntityServer  ActivityEntityType = "SERVER"
	ActivityEntityVM      ActivityEntityType = "VM"
	ActivityEntityService ActivityEntityType = "SERVICE"
)

// ActivityAction represents the type of action performed
type ActivityAction string

const (
	ActivityActionCreated       ActivityAction = "CREATED"
	ActivityActionUpdated       ActivityAction = "UPDATED"
	ActivityActionDeleted       ActivityAction = "DELETED"
	ActivityActionStatusChanged ActivityAction = "STATUS_CHANGED"
)

// Activity represents an activity log entry
type Activity struct {
	ID         string             `db:"id" json:"id"`
	EntityType ActivityEntityType `db:"entity_type" json:"entityType"`
	EntityID   string             `db:"entity_id" json:"entityId"`
	EntityName string             `db:"entity_name" json:"entityName"`
	Action     ActivityAction     `db:"action" json:"action"`
	Changes    json.RawMessage    `db:"changes" json:"changes"`
	UserID     *string            `db:"user_id" json:"userId"`
	UserName   *string            `db:"user_name" json:"userName"`
	CreatedAt  time.Time          `db:"created_at" json:"createdAt"`
}

// ActivityChange represents a single field change
type ActivityChange struct {
	Field    string      `json:"field"`
	OldValue interface{} `json:"oldValue"`
	NewValue interface{} `json:"newValue"`
}

// RCreateActivity is the request body for creating an activity log entry
type RCreateActivity struct {
	EntityType ActivityEntityType `json:"entityType" binding:"required"`
	EntityID   string             `json:"entityId" binding:"required"`
	EntityName string             `json:"entityName" binding:"required"`
	Action     ActivityAction     `json:"action" binding:"required"`
	Changes    []ActivityChange   `json:"changes"`
}

// RSearchActivity is the request params for searching activity logs
type RSearchActivity struct {
	EntityType ActivityEntityType `form:"entityType"`
	EntityID   string             `form:"entityId"`
	Action     ActivityAction     `form:"action"`
	Limit      int                `form:"limit"`
	Offset     int                `form:"offset"`
}
