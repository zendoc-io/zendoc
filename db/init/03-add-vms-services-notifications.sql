-- Migration: Add VMs, Services, Notifications, API Keys, User Preferences
-- Date: 2026-01-18

-- ============================================
-- VIRTUAL MACHINES
-- ============================================

CREATE TYPE devices.VM_STATUS_ENUM AS ENUM ('RUNNING', 'STOPPED', 'PAUSED', 'SUSPENDED', 'ERROR');

CREATE TABLE IF NOT EXISTS devices.vm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  status devices.VM_STATUS_ENUM NOT NULL,
  host_server_id UUID NOT NULL REFERENCES devices.server(id) ON DELETE RESTRICT,
  vcpu SMALLINT NOT NULL CHECK (vcpu > 0),
  ram_gb SMALLINT NOT NULL CHECK (ram_gb > 0),
  disk_gb INTEGER NOT NULL CHECK (disk_gb > 0),
  os_id UUID NOT NULL REFERENCES devices.os(id),
  ip INET,
  subnet_id UUID REFERENCES devices.subnet(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_vm_name ON devices.vm(name);
CREATE INDEX idx_vm_host_server ON devices.vm(host_server_id);
CREATE INDEX idx_vm_status ON devices.vm(status);
CREATE INDEX idx_vm_os ON devices.vm(os_id);

-- ============================================
-- SERVICES
-- ============================================

CREATE TYPE devices.SERVICE_STATUS_ENUM AS ENUM ('RUNNING', 'STOPPED', 'STARTING', 'ERROR');
CREATE TYPE devices.SERVICE_TYPE_ENUM AS ENUM ('WEB_SERVER', 'DATABASE', 'CACHE', 'API', 'QUEUE', 'OTHER');
CREATE TYPE devices.SERVICE_HEALTH_ENUM AS ENUM ('HEALTHY', 'DEGRADED', 'UNHEALTHY', 'UNKNOWN');

CREATE TABLE IF NOT EXISTS devices.service (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL,
  type devices.SERVICE_TYPE_ENUM NOT NULL,
  status devices.SERVICE_STATUS_ENUM NOT NULL,
  host_type VARCHAR(20) NOT NULL CHECK (host_type IN ('SERVER', 'VM')),
  host_id UUID NOT NULL,
  port INTEGER NOT NULL CHECK (port > 0 AND port < 65536),
  protocol VARCHAR(20) NOT NULL,
  health devices.SERVICE_HEALTH_ENUM NOT NULL DEFAULT 'UNKNOWN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_service_name ON devices.service(name);
CREATE INDEX idx_service_type ON devices.service(type);
CREATE INDEX idx_service_status ON devices.service(status);
CREATE INDEX idx_service_host ON devices.service(host_type, host_id);

-- VM-Service Junction (many-to-many)
CREATE TABLE IF NOT EXISTS devices.vm_service (
  vm_id UUID NOT NULL REFERENCES devices.vm(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES devices.service(id) ON DELETE CASCADE,
  PRIMARY KEY (vm_id, service_id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- API KEYS
-- ============================================

CREATE TABLE IF NOT EXISTS auth.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(256) NOT NULL,
  key_hash VARCHAR(256) NOT NULL UNIQUE,
  key_prefix VARCHAR(16) NOT NULL,
  permissions JSONB DEFAULT '[]'::jsonb,
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_api_keys_user ON auth.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON auth.api_keys(key_hash);

-- ============================================
-- NOTIFICATIONS
-- ============================================

CREATE TYPE auth.NOTIFICATION_TYPE_ENUM AS ENUM ('SERVER', 'VM', 'SERVICE', 'USER', 'SYSTEM', 'API');
CREATE TYPE auth.NOTIFICATION_SEVERITY_ENUM AS ENUM ('critical', 'warning', 'info');

CREATE TABLE IF NOT EXISTS auth.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type auth.NOTIFICATION_TYPE_ENUM NOT NULL,
  severity auth.NOTIFICATION_SEVERITY_ENUM NOT NULL DEFAULT 'info',
  title VARCHAR(256) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON auth.notifications(user_id);
CREATE INDEX idx_notifications_read ON auth.notifications(is_read);
CREATE INDEX idx_notifications_created ON auth.notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON auth.notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================
-- SYSTEM SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS auth.system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(256) NOT NULL UNIQUE,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE INDEX idx_system_settings_key ON auth.system_settings(key);

-- ============================================
-- USER PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS auth.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  theme VARCHAR(20) DEFAULT 'dark',
  language VARCHAR(10) DEFAULT 'en',
  email_notifications BOOLEAN DEFAULT TRUE,
  desktop_notifications BOOLEAN DEFAULT FALSE,
  table_preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PASSWORD RESET TOKENS
-- ============================================

CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(256) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_user ON auth.password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON auth.password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_expires ON auth.password_reset_tokens(expires_at);

-- ============================================
-- EMAIL VERIFICATION TOKENS
-- ============================================

CREATE TABLE IF NOT EXISTS auth.email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash VARCHAR(256) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_verification_user ON auth.email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_token ON auth.email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_expires ON auth.email_verification_tokens(expires_at);
