# Zendoc

A full-stack application for managing documentation and infrastructure, built with Next.js and Go.

## Tech Stack

- **Frontend**: Next.js 15.2 (React 19) with TypeScript and TailwindCSS 4
- **Backend**: Go 1.24 with Gin framework
- **Database**: PostgreSQL (latest)
- **Development Tools**: Air (Go hot reload), ESLint, Prettier

## Project Structure

```
zendoc/
├── frontend/           # Next.js application (Port 3000)
├── backend/           # Go API server (Port 8080)
├── db/                # Database initialization scripts
├── docker-compose.yml # PostgreSQL container setup
└── Makefile          # Common commands
```

## Quick Start

### Prerequisites

- Node.js 20+
- Go 1.24+
- Docker or Podman
- Make (optional, for convenience)

### 1. Start the Database

```bash
docker-compose up -d
# or with podman
podman compose up -d
# or using make
make db-reset
```

### 2. Start the Backend

```bash
cd backend
go run main.go
# or with hot reload
air
```

The API will be available at `http://localhost:8080`

### 3. Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:3000`

## Default Credentials

After starting the database, a default admin user is created:

- **Email**: `me@zendoc.io`
- **Password**: `zendoc`
- **Role**: super_admin

## Development Commands

### Frontend

```bash
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Run ESLint
npx prettier --write . # Format code
npx tsc --noEmit     # Type check
```

### Backend

```bash
cd backend
go run main.go       # Run server
air                  # Run with hot reload
go fmt ./...         # Format code
go vet ./...         # Check for issues
go test ./...        # Run tests
```

### Database

```bash
make db-reset        # Reset database and apply seed data
make db-connect      # Connect to PostgreSQL CLI
make db-tables       # List all tables
docker-compose down  # Stop database
```

## API Endpoints

### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info

## Environment Variables

### Backend (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=zendoc
DB_PASSWORD=zendoc
DB_NAME=zendoc
PORT=8080
AES_KEY=your-32-character-key-here
JWT_SECRET=your-jwt-secret-here
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Code Style

- **Frontend**: ESLint + Prettier (configured)
- **Backend**: `go fmt` + `go vet` (run before commits)
- See `AGENTS.md` for detailed coding standards

## Database Schema

### auth schema
- `users` - User accounts
- `organizations` - Organization management
- `sessions` - User sessions
- `roles` - Role definitions
- `user_roles` - User-role assignments

### devices schema
- `subnet` - Network subnets
- `server` - Server inventory
- `os` - Operating systems
- `role` - Device roles
- `icon` - Icon resources
- `document` - Documentation

## Contributing

1. Follow the coding standards in `AGENTS.md`
2. Run linters before committing
3. Test your changes locally
4. Use conventional commit messages (feat:, fix:, docs:, etc.)
