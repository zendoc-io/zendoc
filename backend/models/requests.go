package models

type RUserRegister struct {
	Email        string `json:"email" binding:"required"`
	Password     string `json:"password" binding:"required"`
	Firstname    string `json:"firstname" binding:"required"`
	Lastname     string `json:"lastname" binding:"required"`
	Organization string `json:"organization" binding:"required"`
	Utype        string `json:"type" binding:"required"`
	Role         string `json:"role" binding:"required"`
}

type RUserLoginPassword struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type RUserLogout struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type RCreateRole struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type RAssignRole struct {
	UserID string `json:"user_id" binding:"required"`
	RoleID string `json:"role_id" binding:"required"`
}

type RDeleteRole struct {
	RoleID string `json:"role_id" binding:"required"`
}

type RUserSearch struct {
	Name           string `form:"name"`
	OrganizationId string `form:"org_id"`
}

type RCreateDeviceRole struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type RAssignDeviceRole struct {
	ServerID string `json:"server_id" binding:"required"`
	RoleID   string `json:"role_id" binding:"required"`
}

type RCreateDeviceServer struct {
	Name     string       `json:"name" binding:"required"`
	Status   ServerStatus `json:"status" binding:"required"`
	IP       string       `json:"ip" binding:"required"`
	SubnetID string       `json:"subnet_id" binding:"required"`
	OsID     string       `json:"os_id" binding:"required"`
}

type RUpdateDeviceServer struct {
	ServerID string       `json:"id" binding:"required"`
	Name     string       `json:"name" binding:"required"`
	Status   ServerStatus `json:"status" binding:"required"`
	IP       string       `json:"ip" binding:"required"`
	SubnetID string       `json:"subnet_id" binding:"required"`
	OsID     string       `json:"os_id" binding:"required"`
}

type RSearchDevices struct {
	Name   string       `form:"name"`
	Status ServerStatus `form:"status"`
	IP     string       `form:"ip"`
	Subnet string       `form:"subnet"`
	Os     string       `form:"os"`
	Limit  string       `form:"limit"`
	Offset string       `form:"offset"`
}
