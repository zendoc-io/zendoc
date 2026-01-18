# Database Setup

## Default Admin Credentials

The database seed script (`db/init/02-seed-data.sql`) creates a default admin user with the following credentials:

- **Email**: `me@zendoc.io`
- **Password**: `zendoc`
- **Name**: zendoc
- **Role**: super_admin
- **Organization**: Zendoc Corporation

## Resetting the Database

To reset the database and apply the seed data:

```bash
# Using podman
podman compose down -v && podman compose up -d

# Using docker
docker-compose down -v && docker-compose up -d

# Using make
make db-reset
```

## Changing Default Credentials

If you need to change the default credentials, use the credentials generator:

```bash
cd backend/scripts
go run generate_credentials.go "<email>" "<password>" "<AES_KEY from backend/.env>"
```

This will output the encrypted email and hashed password that you can use in the seed file.

## Database Schema

The database has two main schemas:

- **auth**: User authentication and authorization tables
  - `users` - User accounts
  - `organizations` - Organization management
  - `sessions` - User sessions
  - `roles` - Role definitions
  - `user_roles` - User-role assignments

- **devices**: Device/server management tables
  - `subnet` - Network subnets
  - `server` - Server inventory
  - `os` - Operating systems
  - `role` - Device roles
  - `icon` - Icon resources
  - `document` - Documentation
