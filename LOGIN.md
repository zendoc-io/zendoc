# Development Login Guide

## Quick Start

### 1. Start the Database
```bash
# Using podman
podman compose up -d

# Using docker
docker-compose up -d
```

### 2. Start the Backend
```bash
cd backend
air  # or: go run main.go
```

Backend will run on `http://localhost:8080`

### 3. Start the Frontend
```bash
cd frontend
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Login

Navigate to `http://localhost:3000/login` and use:

- **Email**: `me@zendoc.io`
- **Password**: `zendoc`

## Default Admin User

The seeded admin user has:
- **Email**: me@zendoc.io
- **Password**: zendoc
- **Name**: zendoc
- **Role**: super_admin (full system access)
- **Organization**: Zendoc Corporation

## Environment Variables

Make sure your environment is configured:

### Backend (.env)
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USER=zendoc
DB_PASSWORD=zendoc
DB_NAME=zendoc
DB_SSLMODE=disable
AES_KEY=CCFxX/C5vGWd87pAG+yCaxuFKe5B+7RlknIcHgsC5yc=
```

### Frontend (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Testing Login via API

```bash
# Login
curl -X POST http://localhost:8080/auth/login/password \
  -H "Content-Type: application/json" \
  -d '{"email": "me@zendoc.io", "password": "zendoc"}' \
  -c cookies.txt \
  -v

# Get current user info (requires login cookie)
curl http://localhost:8080/auth/me \
  -b cookies.txt

# Logout
curl http://localhost:8080/auth/logout \
  -b cookies.txt
```

## Creating Additional Users

You can register new users via the API:

```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePassword123",
    "firstname": "John",
    "lastname": "Doe",
    "organization": "b1c2d3e4-f5a6-7890-b1c2-d3e4f5a67890",
    "type": "individual",
    "role": "admin"
  }'
```

## Resetting the Database

If you need to reset to the default seed data:

```bash
# Remove volumes and recreate
podman compose down -v && podman compose up -d

# Or using make
make db-reset
```

## Troubleshooting

### Can't login?
1. Verify the database is running: `podman ps`
2. Check the backend is running: `curl http://localhost:8080/health`
3. Verify the user exists: `podman exec zendoc-postgres psql -U zendoc -d zendoc -c "SELECT firstname FROM auth.users;"`

### Database not initialized?
The initialization scripts in `db/init/` run automatically when creating a new database. If you need to re-initialize:
```bash
podman compose down -v  # Remove volumes
podman compose up -d    # Recreate with fresh data
```
