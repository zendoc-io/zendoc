package models

import "time"

type USesssion struct {
	RefreshToken string
	ExpiresAt    time.Time
}
