-- Seed data for VMs, Services, and Notifications
-- Assumes existing seed data from 02-seed-data.sql

-- Get admin user ID (from seed data: me@zendoc.io)
DO $$
DECLARE
    admin_user_id UUID;
    server1_id UUID;
    server2_id UUID;
    ubuntu_os_id UUID;
    subnet1_id UUID;
    vm_web_01_id UUID;
    vm_web_02_id UUID;
    vm_db_01_id UUID;
    vm_app_01_id UUID;
    vm_cache_01_id UUID;
BEGIN
    -- Get admin user ID (email is encrypted, so just take the first user)
    SELECT id INTO admin_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Get server IDs (match initial seed names)
    SELECT id INTO server1_id FROM devices.server WHERE name = 'web-prod-01' LIMIT 1;
    SELECT id INTO server2_id FROM devices.server WHERE name = 'db-prod-01' LIMIT 1;
    
    -- Get OS ID
    SELECT id INTO ubuntu_os_id FROM devices.os WHERE name = 'Ubuntu 22.04 LTS' LIMIT 1;
    
    -- Get subnet ID
    SELECT id INTO subnet1_id FROM devices.subnet LIMIT 1;

    -- ============================================
    -- VIRTUAL MACHINES
    -- ============================================
    
    INSERT INTO devices.vm (name, status, host_server_id, vcpu, ram_gb, disk_gb, os_id, ip, subnet_id, created_by, updated_by) VALUES
    ('VM-Web-01', 'RUNNING', server1_id, 4, 16, 100, ubuntu_os_id, '192.168.1.101', subnet1_id, admin_user_id, admin_user_id),
    ('VM-Web-02', 'RUNNING', server1_id, 2, 8, 50, ubuntu_os_id, '192.168.1.102', subnet1_id, admin_user_id, admin_user_id),
    ('VM-DB-01', 'RUNNING', server1_id, 8, 32, 500, ubuntu_os_id, '192.168.1.103', subnet1_id, admin_user_id, admin_user_id),
    ('VM-App-01', 'RUNNING', server2_id, 4, 16, 200, ubuntu_os_id, '192.168.1.104', subnet1_id, admin_user_id, admin_user_id),
    ('VM-Cache-01', 'STOPPED', server2_id, 2, 4, 50, ubuntu_os_id, '192.168.1.105', subnet1_id, admin_user_id, admin_user_id),
    ('VM-Test-01', 'RUNNING', server2_id, 2, 8, 100, ubuntu_os_id, '192.168.1.106', subnet1_id, admin_user_id, admin_user_id);

    -- Capture VM IDs for later service inserts
    SELECT id INTO vm_web_01_id FROM devices.vm WHERE name = 'VM-Web-01' LIMIT 1;
    SELECT id INTO vm_web_02_id FROM devices.vm WHERE name = 'VM-Web-02' LIMIT 1;
    SELECT id INTO vm_db_01_id FROM devices.vm WHERE name = 'VM-DB-01' LIMIT 1;
    SELECT id INTO vm_app_01_id FROM devices.vm WHERE name = 'VM-App-01' LIMIT 1;
    SELECT id INTO vm_cache_01_id FROM devices.vm WHERE name = 'VM-Cache-01' LIMIT 1;

    -- ============================================
    -- SERVICES
    -- ============================================
    
    -- Services on Server 1
    INSERT INTO devices.service (name, type, status, host_type, host_id, port, protocol, health, created_by, updated_by) VALUES
    ('nginx', 'WEB_SERVER', 'RUNNING', 'SERVER', server1_id, 80, 'HTTP', 'HEALTHY', admin_user_id, admin_user_id),
    ('docker-registry', 'OTHER', 'RUNNING', 'SERVER', server1_id, 5000, 'HTTPS', 'HEALTHY', admin_user_id, admin_user_id);
    
    -- Services on Server 2
    INSERT INTO devices.service (name, type, status, host_type, host_id, port, protocol, health, created_by, updated_by) VALUES
    ('mysql', 'DATABASE', 'RUNNING', 'SERVER', server2_id, 3306, 'TCP', 'HEALTHY', admin_user_id, admin_user_id);
    
    -- Services on VMs
    INSERT INTO devices.service (name, type, status, host_type, host_id, port, protocol, health, created_by, updated_by) VALUES
    ('api-gateway', 'API', 'RUNNING', 'VM', vm_web_01_id, 8080, 'HTTP', 'HEALTHY', admin_user_id, admin_user_id),
    ('postgresql', 'DATABASE', 'RUNNING', 'VM', vm_db_01_id, 5432, 'TCP', 'HEALTHY', admin_user_id, admin_user_id),
    ('elasticsearch', 'DATABASE', 'RUNNING', 'VM', vm_db_01_id, 9200, 'HTTP', 'HEALTHY', admin_user_id, admin_user_id),
    ('redis', 'CACHE', 'RUNNING', 'VM', vm_cache_01_id, 6379, 'TCP', 'HEALTHY', admin_user_id, admin_user_id),
    ('rabbitmq', 'QUEUE', 'RUNNING', 'VM', vm_app_01_id, 5672, 'AMQP', 'HEALTHY', admin_user_id, admin_user_id),
    ('prometheus', 'OTHER', 'RUNNING', 'VM', vm_app_01_id, 9090, 'HTTP', 'HEALTHY', admin_user_id, admin_user_id),
    ('apache', 'WEB_SERVER', 'STOPPED', 'VM', vm_web_02_id, 80, 'HTTP', 'UNHEALTHY', admin_user_id, admin_user_id);

    -- ============================================
    -- NOTIFICATIONS
    -- ============================================
    
    INSERT INTO auth.notifications (user_id, type, title, message, is_read, created_at) VALUES
    (admin_user_id, 'SERVER', 'Server Status Changed', 'Server 2 went offline', FALSE, NOW() - INTERVAL '2 minutes'),
    (admin_user_id, 'VM', 'Virtual Machine Created', 'VM-Web-05 was successfully created on Server 1', FALSE, NOW() - INTERVAL '1 hour'),
    (admin_user_id, 'USER', 'New Login', 'User ''admin'' logged in from 192.168.1.100', FALSE, NOW() - INTERVAL '2 hours'),
    (admin_user_id, 'SYSTEM', 'Backup Completed', 'System backup completed successfully', FALSE, NOW() - INTERVAL '3 hours'),
    (admin_user_id, 'API', 'API Key Created', 'New API key ''Production Key'' was created', TRUE, NOW() - INTERVAL '5 hours'),
    (admin_user_id, 'SERVICE', 'Service Health Warning', 'Service ''apache'' is showing degraded performance', TRUE, NOW() - INTERVAL '1 day'),
    (admin_user_id, 'VM', 'VM Resource Alert', 'VM-DB-01 CPU usage exceeded 90%', TRUE, NOW() - INTERVAL '1 day'),
    (admin_user_id, 'SERVER', 'Server Maintenance', 'Scheduled maintenance for Server 1 completed', TRUE, NOW() - INTERVAL '2 days'),
    (admin_user_id, 'USER', 'New User Registration', 'New user ''john.doe'' registered', TRUE, NOW() - INTERVAL '2 days'),
    (admin_user_id, 'SYSTEM', 'System Update Available', 'Zendoc v2.1.0 is now available', TRUE, NOW() - INTERVAL '3 days'),
    (admin_user_id, 'API', 'API Rate Limit Warning', 'API key ''Dev Key'' approaching rate limit', TRUE, NOW() - INTERVAL '3 days'),
    (admin_user_id, 'SERVICE', 'Service Restarted', 'Service ''nginx'' was automatically restarted', TRUE, NOW() - INTERVAL '4 days');

    -- ============================================
    -- SYSTEM SETTINGS (Defaults)
    -- ============================================
    
    INSERT INTO auth.system_settings (key, value, description, updated_by) VALUES
    ('app_name', '"Zendoc"', 'Application name', admin_user_id),
    ('timezone', '"UTC"', 'System timezone', admin_user_id),
    ('date_format', '"MM/DD/YYYY"', 'Date format preference', admin_user_id),
    ('session_timeout', '30', 'Session timeout in minutes', admin_user_id),
    ('mfa_enabled', 'false', 'Enable 2FA for all users', admin_user_id),
    ('smtp_server', '"smtp.example.com"', 'SMTP server address', admin_user_id),
    ('smtp_port', '587', 'SMTP server port', admin_user_id),
    ('email_notifications', 'true', 'Enable email notifications', admin_user_id),
    ('auto_backup', 'true', 'Enable automatic backups', admin_user_id),
    ('backup_frequency', '"daily"', 'Backup frequency', admin_user_id),
    ('retention_period', '30', 'Backup retention period in days', admin_user_id);

    -- ============================================
    -- USER PREFERENCES (for admin user)
    -- ============================================
    
    INSERT INTO auth.user_preferences (user_id, theme, language, email_notifications, desktop_notifications, table_preferences)
    VALUES (admin_user_id, 'dark', 'en', TRUE, FALSE, '{
        "servers": {
            "columns": {
                "id": false,
                "name": true,
                "test": false,
                "status": true,
                "ip": true,
                "role": true,
                "os": true,
                "vms": true,
                "services": true
            },
            "sortBy": "name",
            "sortOrder": "asc"
        }
    }'::jsonb);

END $$;
