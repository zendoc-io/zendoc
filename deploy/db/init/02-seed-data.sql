INSERT INTO auth.roles (name, description) VALUES
  ('admin', 'System administrator with full access'),
  ('user', 'Regular user with standard permissions'),
  ('org_admin', 'Organization administrator')
ON CONFLICT (name) DO NOTHING;

INSERT INTO auth.organizations (
  id, 
  name, 
  domain, 
  sso, 
  ldap 
) VALUES (
  'c5f7e1d2-2c3b-4f0a-9d8e-7b6a5c4d3f2e',
  'Demo Organization',
  'demo-org.com',
  false,
  false
) ON CONFLICT (domain) DO NOTHING;

INSERT INTO auth.users (
  id,
  email,
  password,
  firstname,
  lastname,
  type,
  verified,
  active
) VALUES (
  'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
  'admin@zendoc.com',
  -- bcrypt 'Admin123!'
  '$2a$10$3euPcmQFCiblsZAFwQgXvekbKmkQBBMXLU4c0QWTTPaHAb.ZXF2ZW',
  'Admin',
  'User',
  'individual',
  true,
  true
) ON CONFLICT (email) DO NOTHING;

INSERT INTO auth.user_roles (user_id, role_id)
SELECT 
  'a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890',
  id 
FROM auth.roles 
WHERE name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;
