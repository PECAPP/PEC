# Quick Reference Guide

Quick reference for common tasks and patterns in the PEC APP Campus ERP application.

## Development Commands

### Root Monorepo Commands (pnpm)

```bash
pnpm run dev            # Start frontend + backend concurrently (kills port 3001 first)
pnpm run frontend       # Start Next.js dev server only (port 3000)
pnpm run api            # Start NestJS dev server only (port 4000)
pnpm run build          # Build all workspaces via Turbo
pnpm run lint           # Run ESLint across all workspaces
pnpm run setup          # Full setup: install + db:push + prisma:generate + db:seed
pnpm run db:reset       # Wipe DB, push schema, re-seed
pnpm run db:studio      # Open Prisma Studio UI
pnpm run clean:full     # Remove all node_modules and build artifacts
pnpm run clean:next     # Remove only apps/frontend/.next cache
pnpm run check:env      # Validate all required environment variables
pnpm run start:fresh    # Clean .next + build + start production server
```

### Frontend (Next.js 16)

```bash
# Run via root (preferred)
pnpm run frontend

# Or in apps/frontend/ directly
npm run dev          # Start development server with Turbopack
npm run build        # Production build
npm run lint         # Run ESLint for code quality
npm run lint:fix     # Auto-fix linting issues
```

### Backend (NestJS)

```bash
# Run via root (preferred)
pnpm run api

# Or in apps/server/ directly
npm run start:dev        # start-dev-safe.js: checks port 4000, starts ts-node
npm run build            # Production NestJS build
npm run prisma:generate  # Generate Prisma client (@pec/database)
npm run db:migrate       # Run prisma migrate dev
npm run db:push          # Direct schema push (dev only)
npm run db:seed          # Seed database with institutional data
npm run db:backup        # Backup PostgreSQL database
npm run db:restore       # Restore from backup
npm run db:clean         # Clean all data (requires --force flag)
```

### Docker Integration

```bash
pnpm run prod:docker          # Full production stack (docker-compose up -d --build)
pnpm run prod:docker:down     # Stop production stack
pnpm run dev:docker:logs      # Stream Docker Compose logs
pnpm run dev:docker:restart   # Restart Docker Compose services
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
    next: { revalidate: 3600 }, // Cache for 1 hour
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

| Resource         | Primary Location                     |
| ---------------- | ------------------------------------ |
| Protected Routes | `app/(protected)/[feature]/page.tsx` |
| UI Components    | `src/components/ui/`                 |
| Business Hooks   | `src/hooks/`                         |
| Shared Types     | `src/types/`                         |
| API Utilities    | `src/lib/`                           |
| Rewrite Proxy    | `app/api/`                           |
| Backend Modules  | `server/src/[module]/`               |
| Data Schema      | `server/prisma/schema.prisma`        |

## Key Navigation Routes

| Route                 | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `/`                   | Institutional Landing Page                     |
| `/auth`               | Authentication Entry (Login / Register)        |
| `/onboarding`         | New user onboarding flow                       |
| `/role-selection`     | Role selection after registration              |
| `/dashboard`          | Role-Aware Command Center                      |
| `/courses`            | Academic Course Management                     |
| `/attendance`         | Real-Time Attendance Engine                    |
| `/timetable`          | Academic Scheduling                            |
| `/academic-calendar`  | Academic Calendar and Events                   |
| `/examinations`       | Examination Schedule                           |
| `/course-materials`   | Digital Learning Resources                     |
| `/score-sheet`        | Student Score Sheet (backend-persisted)        |
| `/chat`               | Secure Messaging Interface                     |
| `/canteen`            | Canteen Ordering                               |
| `/noticeboard`        | Campus Announcements                           |
| `/hostel-issues`      | Hostel Maintenance Reporting                   |
| `/campus-map`         | 2D / 3D Campus Map                             |
| `/rooms`              | Room Management                                |
| `/clubs`              | Student Clubs                                  |
| `/marketplace`        | Campus Peer-to-Peer Marketplace                |
| `/finance`            | Fee Records and Transactions                   |
| `/faculty`            | Faculty Directory                              |
| `/faculty-bio-system` | Faculty Professional Profiles                  |
| `/student-portfolio`  | Student Portfolio (Projects + Skills + GitHub) |
| `/resume-builder`     | AI-Powered Resume Builder                      |
| `/profile`            | User Identity Management                       |
| `/settings`           | User Settings                                  |
| `/search`             | Global Campus Search                           |
| `/users`              | User Management (Admin)                        |
| `/departments`        | Department Management (Admin)                  |
| `/admin/*`            | System Administration                          |
| `/help`               | Help and Support Center                        |

## Environment Configuration

### Frontend (`apps/frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_secure_key
GEMINI_API_KEY=your_secure_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Backend (`apps/server/.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/pec_db
JWT_SECRET=your_64_char_institutional_secret
FIELD_ENCRYPTION_KEY=your_32_char_encryption_key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_TTL_DAYS=7
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key           # For AI completion endpoints
GITHUB_TOKEN=your_github_token          # Optional, for higher GitHub API rate limits
BACKGROUND_JOB_WORKER_ENABLED=true
SENTRY_DSN=your_sentry_dsn              # Optional, for production error tracking
AUTH_LOCK_THRESHOLD=5                   # Failed attempts before account lock
AUTH_LOCK_MINUTES=15                    # Lock duration in minutes
REQUEST_BODY_LIMIT=1mb
```

## Database Operations

```bash
# From root — preferred approach
pnpm run db:reset            # Wipe + push schema + seed
pnpm run db:studio           # Open Prisma Studio

# From apps/server/ directory
npm run prisma:generate      # Regenerate @pec/database Prisma client
npm run db:migrate           # Run prisma migrate dev (dev only)
npm run db:push              # Direct schema push (dev only)
npm run db:seed              # Seed database
npm run db:backup            # Backup to dump file
npm run db:restore           # Restore from backup
npm run db:clean             # Clean all data (dangerous! use --force)
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
    queryFn: () => fetch('/api/users').then((res) => res.json()),
  });
}

// Data Mutation
function useAddUserRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      fetch('/api/users', {
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

| Module                          | Implementation                      |
| ------------------------------- | ----------------------------------- |
| `next`                          | Next.js 16 Core                     |
| `react` + `react-dom`           | React 19                            |
| `react-hook-form`               | Enterprise Form Engine              |
| `zod`                           | Runtime Type Validation             |
| `@tanstack/react-query`         | Server-State Management             |
| `framer-motion`                 | Motion Design System                |
| `tailwindcss`                   | Design Tokens and Layout            |
| `lucide-react`                  | Institutional Iconography           |
| `@radix-ui/*`                   | Accessible Headless UI Primitives   |
| `three` + `@react-three/fiber`  | 3D Campus Map Rendering             |
| `recharts`                      | Analytics Charts and Graphs         |
| `qrcode.react` + `html5-qrcode` | QR Code Generation and Scanning     |
| `jspdf` + `jspdf-autotable`     | PDF Export (reports, transcripts)   |
| `exceljs`                       | Excel/CSV Export                    |
| `papaparse`                     | CSV Parsing for Import              |
| `pdfjs-dist`                    | PDF Viewer for course materials     |
| `sonner`                        | Toast Notifications                 |
| `date-fns`                      | Date Formatting and Manipulation    |
| `react-markdown` + `remark-gfm` | Markdown Rendering for AI responses |
| `next-themes`                   | Dark/Light Theme Switching          |
| `cmdk`                          | Command Palette Search              |
| `@nestjs/common` etc.           | NestJS 11 Backend Framework         |
| `@nestjs/swagger`               | OpenAPI/Swagger Documentation       |
| `bull`                          | Redis-backed Job Queue              |
| `ioredis`                       | Redis Client for Node.js            |
| `@google/generative-ai`         | Google Gemini AI Integration        |
| `openai`                        | OpenAI GPT Integration              |
| `@qdrant/js-client-rest`        | Qdrant Vector DB Client (RAG)       |
| `@grpc/grpc-js`                 | gRPC Client/Server                  |
| `@sentry/node`                  | Error Tracking and Performance      |
| `prom-client`                   | Prometheus Metrics                  |
| `nestjs-pino`                   | Structured Logging                  |
| `sanitize-html`                 | HTML Sanitization Middleware        |

## Internal Links

- [Features Deep Dive](./FEATURES.md)
- [System Architecture](./ARCHITECTURE.md)
- [Full Development Guide](./DEVELOPMENT.md)
- [Root Overview](../../README.md)

---

Last Updated: March 2026
PEC Development Group
