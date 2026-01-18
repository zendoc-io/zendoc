package models

import (
	"time"
)

type VM struct {
	ID           string     `db:"id" json:"id"`
	Name         string     `db:"name" json:"name"`
	Status       VMStatus   `db:"status" json:"status"`
	HostServerID string     `db:"host_server_id" json:"hostServerId"`
	VCPU         int16      `db:"vcpu" json:"vcpu"`
	RAMGB        int16      `db:"ram_gb" json:"ramGb"`
	DiskGB       int32      `db:"disk_gb" json:"diskGb"`
	OsID         string     `db:"os_id" json:"osId"`
	IP           NullString `db:"ip" json:"ip,omitempty"`
	SubnetID     NullString `db:"subnet_id" json:"subnetId,omitempty"`
	CreatedAt    time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time  `db:"updated_at" json:"updatedAt"`
	CreatedBy    string     `db:"created_by" json:"createdBy"`
	UpdatedBy    string     `db:"updated_by" json:"updatedBy"`
}

type VMStatus string

const (
	VMStatusRunning   VMStatus = "RUNNING"
	VMStatusStopped   VMStatus = "STOPPED"
	VMStatusPaused    VMStatus = "PAUSED"
	VMStatusSuspended VMStatus = "SUSPENDED"
	VMStatusError     VMStatus = "ERROR"
)

// VMSearchReturn includes joined data from related tables
type VMSearchReturn struct {
	VM
	HostServerName string     `db:"host_server_name" json:"hostServerName"`
	OsName         string     `db:"os_name" json:"osName"`
	SubnetName     NullString `db:"subnet_name" json:"subnetName,omitempty"`
	ServiceCount   int        `db:"service_count" json:"serviceCount"`
}

// Request types

type RCreateVM struct {
	Name         string   `json:"name" binding:"required"`
	Status       VMStatus `json:"status" binding:"required"`
	HostServerID string   `json:"hostServerId" binding:"required"`
	VCPU         int16    `json:"vcpu" binding:"required,min=1"`
	RAMGB        int16    `json:"ramGb" binding:"required,min=1"`
	DiskGB       int32    `json:"diskGb" binding:"required,min=1"`
	OsID         string   `json:"osId" binding:"required"`
	IP           *string  `json:"ip"`
	SubnetID     *string  `json:"subnetId"`
}

type RUpdateVM struct {
	ID           string   `json:"id" binding:"required"`
	Name         string   `json:"name" binding:"required"`
	Status       VMStatus `json:"status" binding:"required"`
	HostServerID string   `json:"hostServerId" binding:"required"`
	VCPU         int16    `json:"vcpu" binding:"required,min=1"`
	RAMGB        int16    `json:"ramGb" binding:"required,min=1"`
	DiskGB       int32    `json:"diskGb" binding:"required,min=1"`
	OsID         string   `json:"osId" binding:"required"`
	IP           *string  `json:"ip"`
	SubnetID     *string  `json:"subnetId"`
}

type RSearchVMs struct {
	Name      string   `form:"name"`
	Status    VMStatus `form:"status"`
	HostID    string   `form:"hostId"`
	Limit     string   `form:"limit"`
	Offset    string   `form:"offset"`
	SortBy    string   `form:"sortBy"`
	SortOrder string   `form:"sortOrder"`
}

type RDeleteVM struct {
	ID string `json:"id" binding:"required"`
}
