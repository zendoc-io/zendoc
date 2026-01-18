package models

import "time"

type Service struct {
	ID        string        `db:"id" json:"id"`
	Name      string        `db:"name" json:"name"`
	Type      ServiceType   `db:"type" json:"type"`
	Status    ServiceStatus `db:"status" json:"status"`
	HostType  string        `db:"host_type" json:"hostType"`
	HostID    string        `db:"host_id" json:"hostId"`
	Port      int32         `db:"port" json:"port"`
	Protocol  string        `db:"protocol" json:"protocol"`
	Health    ServiceHealth `db:"health" json:"health"`
	CreatedAt time.Time     `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time     `db:"updated_at" json:"updatedAt"`
	CreatedBy string        `db:"created_by" json:"createdBy"`
	UpdatedBy string        `db:"updated_by" json:"updatedBy"`
}

type ServiceType string

const (
	ServiceTypeWebServer ServiceType = "WEB_SERVER"
	ServiceTypeDatabase  ServiceType = "DATABASE"
	ServiceTypeCache     ServiceType = "CACHE"
	ServiceTypeAPI       ServiceType = "API"
	ServiceTypeQueue     ServiceType = "QUEUE"
	ServiceTypeOther     ServiceType = "OTHER"
)

type ServiceStatus string

const (
	ServiceStatusRunning  ServiceStatus = "RUNNING"
	ServiceStatusStopped  ServiceStatus = "STOPPED"
	ServiceStatusStarting ServiceStatus = "STARTING"
	ServiceStatusError    ServiceStatus = "ERROR"
)

type ServiceHealth string

const (
	ServiceHealthHealthy   ServiceHealth = "HEALTHY"
	ServiceHealthDegraded  ServiceHealth = "DEGRADED"
	ServiceHealthUnhealthy ServiceHealth = "UNHEALTHY"
	ServiceHealthUnknown   ServiceHealth = "UNKNOWN"
)

// ServiceSearchReturn includes joined data
type ServiceSearchReturn struct {
	Service
	HostName string `db:"host_name" json:"hostName"`
}

// Request types

type RCreateService struct {
	Name     string        `json:"name" binding:"required"`
	Type     ServiceType   `json:"type" binding:"required"`
	Status   ServiceStatus `json:"status" binding:"required"`
	HostType string        `json:"hostType" binding:"required,oneof=SERVER VM"`
	HostID   string        `json:"hostId" binding:"required"`
	Port     int32         `json:"port" binding:"required,min=1,max=65535"`
	Protocol string        `json:"protocol" binding:"required"`
	Health   ServiceHealth `json:"health" binding:"required"`
}

type RUpdateService struct {
	ID       string        `json:"id" binding:"required"`
	Name     string        `json:"name" binding:"required"`
	Type     ServiceType   `json:"type" binding:"required"`
	Status   ServiceStatus `json:"status" binding:"required"`
	HostType string        `json:"hostType" binding:"required,oneof=SERVER VM"`
	HostID   string        `json:"hostId" binding:"required"`
	Port     int32         `json:"port" binding:"required,min=1,max=65535"`
	Protocol string        `json:"protocol" binding:"required"`
	Health   ServiceHealth `json:"health" binding:"required"`
}

type RSearchServices struct {
	Name      string        `form:"name"`
	Type      ServiceType   `form:"type"`
	Status    ServiceStatus `form:"status"`
	HostType  string        `form:"hostType"`
	Limit     string        `form:"limit"`
	Offset    string        `form:"offset"`
	SortBy    string        `form:"sortBy"`
	SortOrder string        `form:"sortOrder"`
}

type RDeleteService struct {
	ID string `json:"id" binding:"required"`
}
