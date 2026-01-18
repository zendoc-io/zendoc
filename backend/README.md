# Zendoc Backend

Go 1.24 REST API server built with Gin framework and PostgreSQL.

## Tech Stack

- **Language**: Go 1.24
- **Framework**: Gin 1.10
- **Database**: PostgreSQL with sqlx
- **Authentication**: JWT + sessions
- **Environment**: godotenv
- **Hot Reload**: Air (development)

## Project Structure

```
backend/
├── handlers/          # HTTP request handlers
│   ├── auth.go       # Authentication endpoints
│   └── ...
├── middleware/        # Gin middleware
│   ├── auth.go       # Authentication middleware
│   └── cors.go       # CORS configuration
├── models/            # Data models and types
│   ├── user.go       # User model
│   └── ...
├── routes/            # Route definitions
│   └── routes.go     # Route setup
├── services/          # Business logic
│   ├── auth/         # Authentication service
│   └── ...
├── utils/             # Utility functions
│   └── ...
├── scripts/           # Helper scripts
│   └── generate_credentials.go
├── main.go            # Application entry point
├── go.mod             # Go dependencies
└── .env               # Environment variables
```

## Development

### Prerequisites

- Go 1.24+
- PostgreSQL (via Docker)
- Air (for hot reload)

### Getting Started

```bash
# Install dependencies
go mod download

# Copy environment file
cp .env.example .env
# Edit .env with your configuration

# Run with hot reload (recommended)
air

# Or run directly
go run main.go
```

The API will be available at `http://localhost:8080`

### Installing Air (Hot Reload)

```bash
go install github.com/air-verse/air@latest
```

### Available Commands

```bash
# Development
air                  # Run with hot reload
go run main.go       # Run without hot reload

# Building
go build -o zendoc-api main.go   # Build binary

# Testing
go test ./...        # Run all tests
go test ./services   # Run tests in specific package
go test -v ./...     # Verbose test output
go test ./services -run TestFunctionName  # Run specific test

# Code Quality
go fmt ./...         # Format code (REQUIRED before commits)
go vet ./...         # Check for common mistakes
go mod tidy          # Clean up dependencies
```

## API Endpoints

### Authentication (`/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| POST | `/auth/logout` | Logout user | Yes |
| POST | `/auth/refresh` | Refresh access token | No |
| GET | `/auth/me` | Get current user info | Yes |

### Request/Response Examples

#### Register

```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}

Response:
{
  "status": "ok",
  "data": {
    "user": { ... },
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

#### Login

```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "status": "ok",
  "data": {
    "user": { ... },
    "access_token": "...",
    "refresh_token": "..."
  }
}
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=zendoc
DB_PASSWORD=zendoc
DB_NAME=zendoc

# Server
PORT=8080

# Security
AES_KEY=your-32-character-key-here-12345
JWT_SECRET=your-jwt-secret-key-here
```

## Database Connection

The application uses PostgreSQL with the following configuration:

- **Driver**: lib/pq
- **Query Builder**: sqlx
- **Connection Pooling**: Enabled
- **Transaction Support**: Yes with configurable isolation levels

### Transaction Example

```go
tx, err := db.BeginTxx(ctx, &sql.TxOptions{
    Isolation: sql.LevelSerializable,
})
if err != nil {
    return err
}
defer tx.Rollback()

// Perform database operations
result, err := tx.ExecContext(ctx, query, args...)
if err != nil {
    return err
}

// Commit transaction
return tx.Commit()
```

## Code Style

### Package Structure

```go
package packagename

import (
    // Standard library
    "context"
    "errors"
    "fmt"
    
    // External packages
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    
    // Internal packages
    "backend/models"
    "backend/services"
)
```

### Error Handling

Always check errors immediately:

```go
result, err := someFunction()
if err != nil {
    log.Printf("Error: %v", err)
    return err
}
```

### HTTP Handler Pattern

```go
func HandlerName(c *gin.Context) {
    // Bind request body
    var req models.RequestType
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{
            "status": "Invalid arguments!",
        })
        return
    }
    
    // Business logic
    result, err := service.DoSomething(req)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{
            "status": err.Error(),
        })
        return
    }
    
    // Success response
    c.JSON(http.StatusOK, gin.H{
        "status": "ok",
        "data": result,
    })
}
```

### Response Format

All API responses follow this format:

```go
// Success
{
    "status": "ok",
    "data": { ... }  // Optional
}

// Error
{
    "status": "error message"
}
```

## Naming Conventions

- **Files**: lowercase.go (e.g., `auth.go`)
- **Exported functions/types**: PascalCase (e.g., `RegisterUser`)
- **Unexported**: camelCase (e.g., `validateEmail`)
- **Package names**: lowercase, single word

## Testing

### Writing Tests

```go
package services

import "testing"

func TestFunctionName(t *testing.T) {
    // Arrange
    input := "test"
    
    // Act
    result := FunctionName(input)
    
    // Assert
    if result != expected {
        t.Errorf("Expected %v, got %v", expected, result)
    }
}
```

### Running Tests

```bash
# All tests
go test ./...

# With coverage
go test -cover ./...

# Specific package
go test ./services

# Verbose output
go test -v ./...
```

## Security

### Authentication Flow

1. User registers/logs in with credentials
2. Server validates and returns JWT access token + refresh token
3. Client includes access token in Authorization header
4. Server validates token on protected endpoints
5. Refresh token used to get new access token when expired

### Password Security

- Passwords hashed with bcrypt
- Emails encrypted with AES-256
- Secure session management

### CORS Configuration

CORS is configured in `middleware/cors.go` to allow requests from the frontend.

## Troubleshooting

### Database Connection Issues

```bash
# Check if PostgreSQL is running
docker ps

# Check database logs
docker logs zendoc-postgres

# Test connection
make db-connect
```

### Port Already in Use

```bash
# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>
```

### Module Issues

```bash
# Clean module cache
go clean -modcache

# Reinstall dependencies
go mod download
```

## Best Practices

1. Always run `go fmt ./...` before committing
2. Run `go vet ./...` to check for issues
3. Write tests for business logic
4. Use transactions for multi-step database operations
5. Check `RowsAffected()` after mutations
6. Log errors with context
7. Use proper HTTP status codes
8. Validate input with Gin's binding

## Links

- [Go Documentation](https://go.dev/doc/)
- [Gin Documentation](https://gin-gonic.com/docs/)
- [sqlx Documentation](https://jmoiron.github.io/sqlx/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
