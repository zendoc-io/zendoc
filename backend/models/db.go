package models

import (
	"time"
)

type User struct {
	ID             string     `db:"id" json:"id"`
	Email          string     `db:"email" json:"email"`
	Password       string     `db:"password" json:"-"`
	FirstName      string     `db:"firstname" json:"firstName"`
	LastName       string     `db:"lastname" json:"lastName"`
	OrganizationID string     `db:"organization" json:"organizationId,omitempty"`
	UserType       string     `db:"type" json:"userType"`
	MFAEnabled     bool       `db:"mfa_enabled" json:"mfaEnabled"`
	MFASecret      string     `db:"mfa_secret" json:"-"`
	LastLogin      *time.Time `db:"last_login" json:"lastLogin,omitempty"`
	EmailVerified  bool       `db:"verified" json:"emailVerified"`
	Active         bool       `db:"active" json:"active"`
	CreatedAt      time.Time  `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time  `db:"updated_at" json:"updatedAt"`
}

type Organization struct {
	ID             string    `db:"id" json:"id"`
	Name           string    `db:"name" json:"name"`
	Domain         string    `db:"domain" json:"domain"`
	SSO            bool      `db:"sso" json:"sso"`
	SSOProvider    string    `db:"sso_provider" json:"ssoProvider,omitempty"`
	SSOMetadataURL string    `db:"sso_metadata_url" json:"ssoMetadataUrl,omitempty"`
	SSOEntityID    string    `db:"sso_entity_id" json:"ssoEntityId,omitempty"`
	LDAPEnabled    bool      `db:"ldap" json:"ldapEnabled"`
	LDAPServer     string    `db:"ldap_server" json:"ldapServer,omitempty"`
	LDAPBindDN     string    `db:"ldap_bind_dn" json:"ldapBindDn,omitempty"`
	LDAPSearchBase string    `db:"ldap_search_base" json:"ldapSearchBase,omitempty"`
	AllowedDomains string    `db:"allowed_domains" json:"allowedDomains,omitempty"`
	MFARequired    bool      `db:"mfa_required" json:"mfaRequired"`
	CreatedAt      time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt      time.Time `db:"updated_at" json:"updatedAt"`
}

type Session struct {
	ID           string    `db:"id" json:"id"`
	UserID       string    `db:"user_id" json:"userId"`
	RefreshToken string    `db:"refresh_token" json:"-"`
	UserAgent    string    `db:"user_agent" json:"userAgent"`
	IP           string    `db:"ip" json:"ip"`
	ExpiresAt    time.Time `db:"expires_at" json:"expiresAt"`
	CreatedAt    time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt    time.Time `db:"updated_at" json:"updatedAt"`
}

type Role struct {
	ID          string    `db:"id" json:"id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	CreatedAt   time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt   time.Time `db:"updated_at" json:"updatedAt"`
}

type UserRole struct {
	UserID    string    `db:"user_id" json:"userId"`
	RoleID    string    `db:"role_id" json:"roleId"`
	CreatedAt time.Time `db:"created_at" json:"createdAt"`
	UpdatedAt time.Time `db:"updated_at" json:"updatedAt"`
}
