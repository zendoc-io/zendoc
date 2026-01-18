package models

// Permission constants - resource-based format: <action>:<resource>
const (
	// Devices (Servers)
	PermReadDevices   = "read:devices"
	PermWriteDevices  = "write:devices"
	PermDeleteDevices = "delete:devices"

	// Virtual Machines
	PermReadVMs   = "read:vms"
	PermWriteVMs  = "write:vms"
	PermDeleteVMs = "delete:vms"

	// Services
	PermReadServices   = "read:services"
	PermWriteServices  = "write:services"
	PermDeleteServices = "delete:services"

	// Notifications
	PermReadNotifications  = "read:notifications"
	PermWriteNotifications = "write:notifications"

	// Activity Logs
	PermReadActivity = "read:activity"

	// Roles (Admin only)
	PermReadRoles  = "read:roles"
	PermWriteRoles = "write:roles"

	// Users (Admin only)
	PermReadUsers = "read:users"

	// Search
	PermSearch = "search"

	// API Keys (Self-management)
	PermManageAPIKeys = "manage:apikeys"
)

// AllPermissions returns all available permissions
func AllPermissions() []string {
	return []string{
		PermReadDevices, PermWriteDevices, PermDeleteDevices,
		PermReadVMs, PermWriteVMs, PermDeleteVMs,
		PermReadServices, PermWriteServices, PermDeleteServices,
		PermReadNotifications, PermWriteNotifications,
		PermReadActivity,
		PermReadRoles, PermWriteRoles,
		PermReadUsers,
		PermSearch,
		PermManageAPIKeys,
	}
}

// DefaultReadOnlyPermissions returns default permissions for new API keys
func DefaultReadOnlyPermissions() []string {
	return []string{
		PermReadDevices,
		PermReadVMs,
		PermReadServices,
		PermReadNotifications,
		PermReadActivity,
		PermSearch,
		PermManageAPIKeys,
	}
}

// PermissionDescriptions maps permissions to human-readable descriptions
var PermissionDescriptions = map[string]string{
	PermReadDevices:        "View devices and servers",
	PermWriteDevices:       "Create and update devices/servers",
	PermDeleteDevices:      "Delete devices and servers",
	PermReadVMs:            "View virtual machines",
	PermWriteVMs:           "Create and update virtual machines",
	PermDeleteVMs:          "Delete virtual machines",
	PermReadServices:       "View services",
	PermWriteServices:      "Create and update services",
	PermDeleteServices:     "Delete services",
	PermReadNotifications:  "View notifications",
	PermWriteNotifications: "Mark notifications as read/delete",
	PermReadActivity:       "View activity logs",
	PermReadRoles:          "View roles",
	PermWriteRoles:         "Manage roles (admin only)",
	PermReadUsers:          "Search users",
	PermSearch:             "Use search functionality",
	PermManageAPIKeys:      "Manage your API keys",
}

// PermissionCategories organizes permissions by resource type
var PermissionCategories = map[string][]string{
	"Devices & Servers": {
		PermReadDevices,
		PermWriteDevices,
		PermDeleteDevices,
	},
	"Virtual Machines": {
		PermReadVMs,
		PermWriteVMs,
		PermDeleteVMs,
	},
	"Services": {
		PermReadServices,
		PermWriteServices,
		PermDeleteServices,
	},
	"Notifications": {
		PermReadNotifications,
		PermWriteNotifications,
	},
	"Activity & Search": {
		PermReadActivity,
		PermSearch,
	},
	"Roles & Users": {
		PermReadRoles,
		PermWriteRoles,
		PermReadUsers,
	},
	"API Keys": {
		PermManageAPIKeys,
	},
}

// HasPermission checks if a permission slice contains a specific permission
func HasPermission(permissions []string, required string) bool {
	for _, perm := range permissions {
		if perm == required {
			return true
		}
	}
	return false
}

// HasAnyPermission checks if slice has ANY of the required permissions
func HasAnyPermission(permissions []string, required []string) bool {
	for _, req := range required {
		if HasPermission(permissions, req) {
			return true
		}
	}
	return false
}

// ValidatePermissions checks if all provided permissions are valid
func ValidatePermissions(permissions []string) bool {
	allPerms := AllPermissions()
	for _, perm := range permissions {
		if !HasPermission(allPerms, perm) {
			return false
		}
	}
	return true
}
