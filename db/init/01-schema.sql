CREATE SCHEMA IF NOT EXISTS auth;

CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  firstname VARCHAR(100),
  lastname VARCHAR(100),
  organization UUID,
  type VARCHAR(20) NOT NULL,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  last_login TIMESTAMP WITH TIME ZONE,
  verified BOOLEAN DEFAULT FALSE,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  sso BOOLEAN DEFAULT FALSE,
  sso_provider VARCHAR(50),
  sso_metadata_url TEXT,
  sso_entity_id VARCHAR(255),
  ldap BOOLEAN DEFAULT FALSE,
  ldap_server VARCHAR(255),
  ldap_bind_dn VARCHAR(255),
  ldap_search_base VARCHAR(255),
  allowed_domains TEXT,
  mfa_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE auth.users 
  ADD CONSTRAINT fk_user_organization 
  FOREIGN KEY (organization) 
  REFERENCES auth.organizations(id)
  ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS auth.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  refresh_token VARCHAR(255) NOT NULL,
  user_agent TEXT,
  ip INET,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
  user_id UUID NOT NULL,
  role_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id),
  CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES auth.roles(id) ON DELETE CASCADE
);

CREATE INDEX idx_users_email ON auth.users(email);
CREATE INDEX idx_users_organization ON auth.users(organization);
CREATE INDEX idx_sessions_user ON auth.sessions(user_id);
CREATE INDEX idx_sessions_token ON auth.sessions(refresh_token);
CREATE INDEX idx_user_roles_user ON auth.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON auth.user_roles(role_id);

CREATE SCHEMA IF NOT EXISTS devices;
CREATE TYPE devices.SERVER_STATUS_ENUM AS ENUM ('ACTIVE', 'INACTIVE', 'MAINTENANCE', 'PROVISIONING', 'DECOMMISSIONED');

CREATE TABLE IF NOT EXISTS devices.subnet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL UNIQUE,
  mask SMALLINT,
  gateway INET,
  dns INET,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS devices.role (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);


CREATE TABLE IF NOT EXISTS devices.icon (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(256) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS devices.os (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL UNIQUE,
  description TEXT,
  icon_id UUID REFERENCES devices.icon(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS devices.document (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url VARCHAR(256) NOT NULL UNIQUE,
  mime_type VARCHAR(256) NOT NULL,
  name VARCHAR(256) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS devices.server (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(256) NOT NULL, 
  status devices.SERVER_STATUS_ENUM NOT NULL,
  ip INET NOT NULL, 
  subnet_id UUID NOT NULL REFERENCES devices.subnet(id),
  os_id UUID NOT NULL REFERENCES devices.os(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID NOT NULL REFERENCES auth.users(id)
);

ALTER TABLE devices.server ADD CONSTRAINT uq_server_ip_subnet UNIQUE (ip, subnet_id);

CREATE TABLE IF NOT EXISTS devices.server_role (
  server_id UUID NOT NULL REFERENCES devices.server(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES devices.role(id) ON DELETE CASCADE,
  PRIMARY KEY (server_id, role_id), 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS devices.server_document(
  server_id UUID NOT NULL REFERENCES devices.server(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES devices.document(id) ON DELETE CASCADE,
  PRIMARY KEY (server_id, document_id), 
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_server_name ON devices.server(name);
CREATE INDEX idx_server_ip ON devices.server(ip);
CREATE INDEX idx_server_subnet_id ON devices.server(subnet_id);
CREATE INDEX idx_server_os_id ON devices.server(os_id);
CREATE INDEX idx_os_icon_id ON devices.os(icon_id);
