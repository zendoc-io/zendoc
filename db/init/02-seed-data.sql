-- Insert Organizations
INSERT INTO auth.organizations (id, name, domain, sso, sso_provider, mfa_required) VALUES
('b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'Zendoc Corporation', 'zendoc.com', false, NULL, true),
('c2d3e4f5-a6b7-8901-c2d3-e4f5a6b78901', 'Tech Solutions Inc', 'techsolutions.io', true, 'okta', false),
('d3e4f5a6-b7c8-9012-d3e4-f5a6b7c89012', 'CloudFirst Ltd', 'cloudfirst.net', false, NULL, false);

-- Insert Users
-- Default admin user: me@zendoc.io / zendoc
INSERT INTO auth.users (id, email, password, firstname, lastname, organization, type, mfa_enabled, verified, active) VALUES 
('d8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'PkBftL9bE7SpgnlBBldcjp4uvRs3+yKoIlYs75YJi7Z/s1fVKb63XA==', '36940c96d11c90d3cf154eef36f942b3d6798f8c3b7c18dd353b93edf01b34c4', 'Tim', 'Witzdam', 'b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'individual', false, true, true);

-- Insert Roles
INSERT INTO auth.roles (id, name, description) VALUES
('c8d9e0f1-a2b3-4567-c8d9-e0f1a2b34567', 'super_admin', 'Full system access'),
('d9e0f1a2-b3c4-5678-d9e0-f1a2b3c45678', 'admin', 'Administrative access'),
('e0f1a2b3-c4d5-6789-e0f1-a2b3c4d56789', 'user', 'Standard user access'),
('f1a2b3c4-d5e6-7890-f1a2-b3c4d5e67890', 'read_only', 'Read only access');

-- Insert User Roles
INSERT INTO auth.user_roles (user_id, role_id) VALUES
('d8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'c8d9e0f1-a2b3-4567-c8d9-e0f1a2b34567');

-- Insert Subnets
INSERT INTO devices.subnet (id, name, mask, gateway, dns, created_by, updated_by) VALUES
('d5e6f7a8-b9c0-1234-d5e6-f7a8b9c01234', 'Production Network', 24, '10.0.1.1', '10.0.1.2', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('e6f7a8b9-c0d1-2345-e6f7-a8b9c0d12345', 'Development Network', 24, '10.0.2.1', '10.0.2.2', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('f7a8b9c0-d1e2-3456-f7a8-b9c0d1e23456', 'DMZ Network', 24, '172.16.0.1', '172.16.0.2', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('a8b9c0d1-e2f3-4567-a8b9-c0d1e2f34567', 'Management Network', 24, '192.168.1.1', '192.168.1.2', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert Icons
INSERT INTO devices.icon (id, url, created_by, updated_by) VALUES
('b9c0d1e2-f3a4-5678-b9c0-d1e2f3a45678', '/icons/ubuntu.svg', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('c0d1e2f3-a4b5-6789-c0d1-e2f3a4b56789', '/icons/windows.svg', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('d1e2f3a4-b5c6-7890-d1e2-f3a4b5c67890', '/icons/rhel.svg', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('e2f3a4b5-c6d7-8901-e2f3-a4b5c6d78901', '/icons/debian.svg', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert OS
INSERT INTO devices.os (id, name, description, icon_id, created_by, updated_by) VALUES
('f3a4b5c6-d7e8-9012-f3a4-b5c6d7e89012', 'Ubuntu 22.04 LTS', 'Ubuntu Jammy Jellyfish', 'b9c0d1e2-f3a4-5678-b9c0-d1e2f3a45678', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('a4b5c6d7-e8f9-0123-a4b5-c6d7e8f90123', 'Windows Server 2022', 'Microsoft Windows Server 2022 Datacenter', 'c0d1e2f3-a4b5-6789-c0d1-e2f3a4b56789', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('b5c6d7e8-f9a0-1234-b5c6-d7e8f9a01234', 'RHEL 9', 'Red Hat Enterprise Linux 9', 'd1e2f3a4-b5c6-7890-d1e2-f3a4b5c67890', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('c6d7e8f9-a0b1-2345-c6d7-e8f9a0b12345', 'Debian 12', 'Debian Bookworm', 'e2f3a4b5-c6d7-8901-e2f3-a4b5c6d78901', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert Roles
INSERT INTO devices.role (id, name, description, created_by, updated_by) VALUES
('d7e8f9a0-b1c2-3456-d7e8-f9a0b1c23456', 'Web Server', 'HTTP/HTTPS web server role', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('e8f9a0b1-c2d3-4567-e8f9-a0b1c2d34567', 'Database Server', 'Database server role', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('f9a0b1c2-d3e4-5678-f9a0-b1c2d3e45678', 'Application Server', 'Application server role', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('a0b1c2d3-e4f5-6789-a0b1-c2d3e4f56789', 'Load Balancer', 'Load balancer role', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert Servers
INSERT INTO devices.server (id, name, status, ip, subnet_id, os_id, created_by, updated_by) VALUES
('b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'web-prod-01', 'ACTIVE', '10.0.1.10', 'd5e6f7a8-b9c0-1234-d5e6-f7a8b9c01234', 'f3a4b5c6-d7e8-9012-f3a4-b5c6d7e89012', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('c2d3e4f5-a6b7-8901-c2d3-e4f5a6b78901', 'db-prod-01', 'ACTIVE', '10.0.1.20', 'd5e6f7a8-b9c0-1234-d5e6-f7a8b9c01234', 'b5c6d7e8-f9a0-1234-b5c6-d7e8f9a01234', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('d3e4f5a6-b7c8-9012-d3e4-f5a6b7c89012', 'app-dev-01', 'MAINTENANCE', '10.0.2.10', 'e6f7a8b9-c0d1-2345-e6f7-a8b9c0d12345', 'a4b5c6d7-e8f9-0123-a4b5-c6d7e8f90123', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('e4f5a6b7-c8d9-0123-e4f5-a6b7c8d90123', 'lb-dmz-01', 'ACTIVE', '172.16.0.10', 'f7a8b9c0-d1e2-3456-f7a8-b9c0d1e23456', 'c6d7e8f9-a0b1-2345-c6d7-e8f9a0b12345', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('f5a6b7c8-d9e0-1234-f5a6-b7c8d9e01234', 'web-prod-02', 'PROVISIONING', '10.0.1.11', 'd5e6f7a8-b9c0-1234-d5e6-f7a8b9c01234', 'f3a4b5c6-d7e8-9012-f3a4-b5c6d7e89012', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert Documents
INSERT INTO devices.document (id, url, mime_type, name, created_by, updated_by) VALUES
('a6b7c8d9-e0f1-2345-a6b7-c8d9e0f12345', '/docs/server-setup-guide.pdf', 'application/pdf', 'Server Setup Guide', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('b7c8d9e0-f1a2-3456-b7c8-d9e0f1a23456', '/docs/network-diagram.png', 'image/png', 'Network Topology Diagram', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('c8d9e0f1-a2b3-4567-c8d9-e0f1a2b34567', '/docs/security-policy.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'Security Policy', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe'),
('d9e0f1a2-b3c4-5678-d9e0-f1a2b3c45678', '/docs/maintenance-schedule.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Maintenance Schedule', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe', 'd8221e3e-7d6e-4169-9f7d-7b6c591b2dfe');

-- Insert Server Roles
INSERT INTO devices.server_role (server_id, role_id) VALUES
('b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'd7e8f9a0-b1c2-3456-d7e8-f9a0b1c23456'),
('c2d3e4f5-a6b7-8901-c2d3-e4f5a6b78901', 'e8f9a0b1-c2d3-4567-e8f9-a0b1c2d34567'),
('d3e4f5a6-b7c8-9012-d3e4-f5a6b7c89012', 'f9a0b1c2-d3e4-5678-f9a0-b1c2d3e45678'),
('e4f5a6b7-c8d9-0123-e4f5-a6b7c8d90123', 'a0b1c2d3-e4f5-6789-a0b1-c2d3e4f56789'),
('f5a6b7c8-d9e0-1234-f5a6-b7c8d9e01234', 'd7e8f9a0-b1c2-3456-d7e8-f9a0b1c23456');

-- Insert Server Documents
INSERT INTO devices.server_document (server_id, document_id) VALUES
('b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'a6b7c8d9-e0f1-2345-a6b7-c8d9e0f12345'),
('b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890', 'c8d9e0f1-a2b3-4567-c8d9-e0f1a2b34567'),
('c2d3e4f5-a6b7-8901-c2d3-e4f5a6b78901', 'a6b7c8d9-e0f1-2345-a6b7-c8d9e0f12345'),
('d3e4f5a6-b7c8-9012-d3e4-f5a6b7c89012', 'd9e0f1a2-b3c4-5678-d9e0-f1a2b3c45678'),
('e4f5a6b7-c8d9-0123-e4f5-a6b7c8d90123', 'b7c8d9e0-f1a2-3456-b7c8-d9e0f1a23456');
