# Zendoc Frontend

Next.js 15 application with React 19, TypeScript, and TailwindCSS 4.

## Tech Stack

- **Framework**: Next.js 15.2 (App Router)
- **React**: 19.0
- **TypeScript**: 5.x (strict mode)
- **Styling**: TailwindCSS 4
- **State Management**: SWR 2.3
- **UI Components**: Custom components with TailwindCSS
- **Notifications**: react-hot-toast, sonner
- **Charts**: recharts
- **Date Utilities**: date-fns

## Project Structure

```
frontend/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Home page
│   │   ├── auth/         # Authentication pages
│   │   └── ...
│   ├── components/       # Reusable React components
│   │   ├── base/         # Base UI components
│   │   └── ...
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   │   └── api.ts        # API fetch wrapper
│   └── ...
├── public/               # Static assets
├── tailwind.config.ts    # Tailwind configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prettier --write .      # Format code with Prettier
npx tsc --noEmit     # Type check without emitting files
```

## Code Style

### Component Structure

```typescript
import type { ComponentProps } from "./types";

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

### Import Order

1. React and Next.js imports
2. External libraries
3. Internal utilities (using `@/*` alias)
4. Types
5. Styles

```typescript
import React from "react";
import Link from "next/link";
import { SomeLibrary } from "some-library";
import { apiFetch } from "@/utils/api";
import type { ComponentProps } from "./types";
```

### Naming Conventions

- **Components**: PascalCase (e.g., `BaseButton.tsx`)
- **Utilities**: camelCase (e.g., `api.ts`)
- **Props**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Folders**: camelCase or kebab-case

### TypeScript

- Strict mode enabled
- Always use explicit types for function parameters and return values
- Prefer `interface` for object shapes
- Use `type` for unions/intersections
- Use path alias `@/*` for imports from `src/`

### Styling

- Use TailwindCSS utility classes
- Follow Prettier + prettier-plugin-tailwindcss for formatting
- Keep className strings organized by Tailwind order (layout, spacing, typography, colors, etc.)

```typescript
<div className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white">
  Content
</div>
```

## API Integration

### Using apiFetch

```typescript
import { apiFetch } from "@/utils/api";

// GET request
const data = await apiFetch<ResponseType>("/api/endpoint");

// POST request
const response = await apiFetch<ResponseType>(
  "/api/endpoint",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key: "value" }),
  }
);
```

### API Response Format

All API responses follow this structure:

```typescript
{
  status: "ok" | "error message",
  data?: any  // Optional response data
}
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## Building for Production

```bash
# Build the application
npm run build

# Start production server
npm run start
```

The build output will be in the `.next` directory.

## Troubleshooting

### Type Errors

```bash
# Run type check to see all errors
npx tsc --noEmit
```

### Linting Issues

```bash
# Run ESLint
npm run lint

# Auto-fix issues
npm run lint -- --fix
```

### Formatting

```bash
# Check formatting
npx prettier --check .

# Fix formatting
npx prettier --write .
```

## Best Practices

1. Always run `npx tsc --noEmit` during development
2. Use `npm run lint` before committing
3. Format code with Prettier before committing
4. Keep components small and focused
5. Use TypeScript types for all props and state
6. Prefer functional components with hooks
7. Use SWR for data fetching when appropriate

## Links

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
