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
