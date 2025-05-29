package models

import (
	"time"

	"github.com/goccy/go-json"
)

type SubnetSearchReturn struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Mask      string    `json:"mask"`
	Gateway   string    `json:"gateway"`
	DNS       string    `json:"dns"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedBy string    `json:"created_by"`
	UpdatedBy string    `json:"updated_by"`
}

type IconSearchReturn struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	CreatedBy string    `json:"created_by"`
	UpdatedBy string    `json:"updated_by"`
}

type OSSearchReturn struct {
	ID          string           `json:"id"`
	Name        string           `json:"name"`
	Description string           `json:"description"`
	Icon        IconSearchReturn `json:"icon"`
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	CreatedBy   string           `json:"created_by"`
	UpdatedBy   string           `json:"updated_by"`
}

type DeviceSearchReturn struct {
	ID        string          `db:"id" json:"id"`
	Name      string          `db:"name" json:"name"`
	Status    ServerStatus    `db:"status" json:"status"`
	IP        string          `db:"ip" json:"ip"`
	Subnet    json.RawMessage `json:"subnet"`
	Os        json.RawMessage `json:"os"`
	CreatedAt time.Time       `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time       `db:"updated_at" json:"updatedAt"`
	CreatedBy string          `db:"created_by" json:"createdBy"`
	UpdatedBy string          `db:"updated_by" json:"updatedBy"`
}
