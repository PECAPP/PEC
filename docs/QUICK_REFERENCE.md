# Quick Reference Guide

Quick reference for common tasks and patterns in the PEC APP Campus ERP application.

## Development Commands

### Frontend (Next.js 16)

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Auto-fix linting issues
```

### Backend (NestJS)

```bash
cd server
npm run start:dev    # Start NestJS with hot reload
npm run build        # Production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run database migrations
npm run seed         # Seed database with initial data
```

### Docker Integration

```bash
npm run dev:docker:backend   # Start Postgres + Backend in Docker
npm run dev:docker:frontend  # Start Frontend in Docker
npm run prod:docker         # Full production deployment
```

## Common Patterns

### Creating a New Page

1. Create the page file in `app/(protected)/`:
```typescript
// app/(protected)/example/page.tsx
import { redirect } from 'next/navigation';

export default async function ExamplePage() {
  // Server component - perform direct data fetching or auth checks here
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Example Page</h1>
    </div>
  );
}
```

2. The page will automatically be wrapped by the protected layout with navigation guards.

### Client Component Best Practices

```typescript
// components/ExampleClient.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ExampleClient() {
  const [count, setCount] = useState(0);
  
  return (
    <Button variant="outline" onClick={() => setCount(count + 1)}>
      Interactions: {count}
    </Button>
  );
}
```

### Data Fetching Strategies

```typescript
// Server-side (Standard Fetch)
async function getAcademicData() {
  const res = await fetch('http://localhost:4000/courses', {
    next: { revalidate: 3600 } // Cache for 1 hour
  });
  if (!res.ok) throw new Error('Query failure');
  return res.json();
}

// Client-side (TanStack Query)
import { useQuery } from '@tanstack/react-query';

function useAcademicCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const res = await fetch('/api/courses');
      return res.json();
    },
  });
}
```

### Form Handling with Zod

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(2, "Name too short"),
  email: z.string().email("Invalid institutional email"),
});

export function StudentForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit((data) => console.log(data))}>
      <input {...form.register('name')} className="border p-2 rounded" />
      <input {...form.register('email')} className="border p-2 rounded" />
      <button type="submit">Submit Record</button>
    </form>
  );
}
```

### UI Components (shadcn/ui)

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function UIExample() {
  return (
    <Card className="shadow-lg">
      <CardHeader>System Interface</CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Input placeholder="Search records..." />
        <Button variant="default">Execute Action</Button>
      </CardContent>
    </Card>
  );
}
```

## Project Directory Map

| Resource | Primary Location |
|------|-----------|
| Protected Routes | `app/(protected)/[feature]/page.tsx` |
| UI Components | `src/components/ui/` |
| Business Hooks | `src/hooks/` |
| Shared Types | `src/types/` |
| API Utilities | `src/lib/` |
| Rewrite Proxy | `app/api/` |
| Backend Modules | `server/src/[module]/` |
| Data Schema | `server/prisma/schema.prisma` |

## Key Navigation Routes

| Route | Purpose |
|-------|---------|
| `/` | Institutional Landing Page |
| `/auth` | Authentication Entry |
| `/dashboard` | Role-Aware Command Center |
| `/courses` | Academic Course Management |
| `/attendance` | Real-Time Attendance Engine |
| `/timetable` | Academic Scheduling |
| `/chat` | Secure Messaging Interface |
| `/canteen` | Night Canteen Ordering |
| `/resume-builder` | AI Career Suite |
| `/profile` | User Identity Management |
| `/admin/*` | System Administration |

## Environment Configuration

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_secure_key
```

### Backend (server/.env)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pec_db
JWT_SECRET=institutional_encryption_secret
PORT=4000
```

## Database Operations

```bash
# Refresh Prisma client types
cd server && npm run prisma:generate

# Synchronize schema and generate migration
npm run prisma:migrate dev --name update_schema

# Direct schema push (development only)
npm run prisma:push

# Reset database to seed state
npm run prisma:migrate reset

# Graphical database browser
npm run prisma:studio
```

## Performance and Maintenance

### Cache Management

```bash
# Clear Next.js build cache
npm run clean:next

# Deep cleanup of dependencies
rm -rf node_modules package-lock.json && npm install
```

### Port Diagnostics

```bash
# Windows: Identify process on Port 3000
netstat -ano | findstr :3000

# Terminate process by PID
taskkill /PID <PID> /F
```

## Styling and Responsiveness

```tsx
// Conditional class management
import { cn } from '@/lib/utils';

<div className={cn(
  "p-4 transition-colors",
  isActive ? "bg-accent" : "bg-card",
  className
)}>

// Responsive grid system
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## Data Synchronization (TanStack Query)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Data Fetching
function useUserRecords() {
  return useQuery({
    queryKey: ['users', 'records'],
    queryFn: () => fetch('/api/users').then(res => res.json()),
  });
}

// Data Mutation
function useAddUserRecord() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

## Primary Infrastructure Dependencies

| Module | Implementation |
|---------|---------|
| `next` | Next.js 16 Core |
| `react-hook-form` | Enterprise Form Engine |
| `zod` | Runtime Type Validation |
| `@tanstack/react-query` | Server-State Management |
| `framer-motion` | Motion Design System |
| `tailwindcss` | Design Tokens and Layout |
| `lucide-react` | Institutional Iconography |

## Internal Links

- [Features Deep Dive](./FEATURES.md)
- [System Architecture](./ARCHITECTURE.md)
- [Full Development Guide](./DEVELOPMENT.md)
- [Root Overview](../../README.md)

---

Last Updated: March 2026
PEC Development Group
