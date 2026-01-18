# Zendoc - Agent Development Guide

This document provides coding agents with essential information about the Zendoc project structure, development commands, and coding standards.

## Project Overview

Zendoc is a full-stack application with:
- **Frontend**: Next.js 15 (React 19) with TypeScript, TailwindCSS
- **Backend**: Go 1.24 with Gin framework
- **Database**: PostgreSQL (via Docker)

## Project Structure

```
zendoc/
├── frontend/           # Next.js application
│   ├── src/
│   │   ├── app/       # Next.js app router pages
│   │   ├── components/ # Reusable React components
│   │   ├── types/     # TypeScript type definitions
│   │   └── utils/     # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── backend/           # Go API server
│   ├── handlers/      # HTTP request handlers
│   ├── middleware/    # Gin middleware
│   ├── models/        # Data models and types
│   ├── routes/        # Route definitions
│   ├── services/      # Business logic
│   ├── main.go        # Application entry point
│   └── go.mod
├── db/                # Database initialization scripts
├── docker-compose.yml
└── Makefile
```

---

## Build, Lint & Test Commands

### Frontend (Next.js)

**Working directory**: `frontend/`

```bash
# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Format code with Prettier
npx prettier --write .

# Type check
npx tsc --noEmit
```

### Backend (Go)

**Working directory**: `backend/`

```bash
# Run development server (uses Air for hot reload)
air

# Run without hot reload
go run main.go

# Build binary
go build -o zendoc-api main.go

# Format code (ALWAYS run before committing)
go fmt ./...

# Run tests
go test ./...

# Run tests in a specific package
go test ./services

# Run a single test
go test ./services -run TestFunctionName

# Run tests with verbose output
go test -v ./...

# Check for common mistakes
go vet ./...
```

### Database

```bash
# Start PostgreSQL
docker-compose up -d

# Stop services
docker-compose down

# Connect to database
make db-connect

# Reset database
make db-reset

# View tables
make db-tables
```

---

## Code Style Guidelines

### Frontend (TypeScript/React)

#### Imports

```typescript
// Order: React, Next.js, external libraries, internal utilities, types, styles
import React from "react";
import Link from "next/link";
import { SomeLibrary } from "some-library";
import { apiFetch } from "@/utils/api";
import type { BaseButtonProps } from "./types";
```

#### Component Structure

- Use functional components with TypeScript
- Export type definitions with component
- Define props type inline or separately

```typescript
export type ComponentNameProps = {
  children?: React.ReactNode;
  required: string;
  optional?: boolean;
};

export default function ComponentName({ 
  children, 
  required, 
  optional = false 
}: ComponentNameProps) {
  // Implementation
}
```

#### Naming Conventions

- Components: `PascalCase` (e.g., `BaseButton.tsx`)
- Files: `PascalCase` for components, `camelCase` for utilities
- Props: `camelCase` with descriptive names
- Constants: `UPPER_SNAKE_CASE`
- Folders: `camelCase` or `kebab-case`

#### TypeScript

- Always enable `strict` mode (already configured)
- Use explicit types for function parameters and return values
- Prefer `interface` for object shapes, `type` for unions/intersections
- Use path alias `@/*` for imports from `src/`

#### Styling

- Use TailwindCSS utility classes
- Follow Prettier formatting (configured with `prettier-plugin-tailwindcss`)
- Keep className strings organized by Tailwind order

---

### Backend (Go)

#### Package Structure

```go
package packagename

import (
    // Standard library first
    "context"
    "database/sql"
    "errors"
    
    // External packages
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    
    // Internal packages last
    "backend/models"
    "backend/services"
)
```

#### Naming Conventions

- Files: `lowercase.go` (e.g., `auth.go`)
- Exported functions/types: `PascalCase` (e.g., `RegisterUser`)
- Unexported: `camelCase` (e.g., `validateEmail`)
- Constants: `PascalCase` or `camelCase` based on export
- Package names: lowercase, single word

#### Error Handling

```go
// ALWAYS check errors immediately
result, err := someFunction()
if err != nil {
    // Handle error appropriately
    log.Printf("DB Error: %v", err.Error())
    return err
}

// Use custom error messages
if condition {
    return errors.New("User already exists!")
}
```

#### HTTP Handlers Pattern

```go
func HandlerName(c *gin.Context) {
    var requestBody models.RequestType
    if err := c.ShouldBindJSON(&requestBody); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"status": "Invalid arguments!"})
        return
    }
    
    // Business logic
    
    c.JSON(http.StatusOK, gin.H{"status": "ok", "data": data})
}
```

#### Database Transactions

- Always use transactions with proper isolation levels
- Include defer with rollback for panic recovery
- Check `RowsAffected()` after mutations

---

## Development Workflow

1. **Before starting work**: Pull latest changes, ensure dependencies are installed
2. **During development**: 
   - Frontend: Run `npm run dev` and `npx tsc --noEmit` for type checking
   - Backend: Use `air` for hot reload during development
   - Run linters frequently
3. **Before committing**:
   - Frontend: Run `npm run lint` and format with Prettier
   - Backend: Run `go fmt ./...` and `go vet ./...`
   - Test affected functionality
4. **Commit messages**: Use conventional format (feat:, fix:, docs:, etc.)

---

## API Response Format

All API responses follow this structure:

```json
{
  "status": "ok" | "error message",
  "data": { ... }  // Optional
}
```

---

## Common Patterns

### Frontend API Calls

```typescript
import { apiFetch } from "@/utils/api";

const response = await apiFetch<ApiResponse<DataType>>(
  "/api/endpoint",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }
);
```

### Backend Service Layer

- Handlers receive requests and validate input
- Services contain business logic and database operations
- Models define data structures
- Middleware handles authentication and authorization

---

## Notes

- No existing Cursor or Copilot rules found in this project
- Always test changes locally before committing
- Database runs in Docker; use Makefile commands for convenience
- Frontend uses Next.js App Router (not Pages Router)
