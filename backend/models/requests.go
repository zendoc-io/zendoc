package models

type RUserRegister struct {
	Email        string `json:"email"`
	Password     string `json:"password"`
	Firstname    string `json:"firstname"`
	Lastname     string `json:"lastname"`
	Organization string `json:"organization"`
	Utype        string `json:"type"`
	Role         string `json:"role"`
}

type RUserLoginPassword struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RUserLogout struct {
	RefreshToken string `json:"refresh_token"`
}

type RCreateRole struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type RAssignRole struct {
	UserID string `json:"user_id"`
	RoleID string `json:"role_id"`
}

type RDeleteRole struct {
	RoleID string `json:"role_id"`
}
