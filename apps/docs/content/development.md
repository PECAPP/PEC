# PEC APP - Institutional Development and Operational Lifecycle

A comprehensive guide to the institutional development lifecycle, environment orchestration, and deployment protocols for the PEC APP ERP platform.

## 1. System Prerequisites

The following infrastructure must be provisioned before initiating the development lifecycle:

- **Computational Architecture**: Node.js v20.10.0 (LTS) or higher.
- **Package Management**: pnpm v9.12.3 (configured in `packageManager` field of root `package.json`). Install via `npm install -g pnpm@9.12.3`.
- **Relational Persistence**: PostgreSQL v16+ (Local or managed).
- **Cache and Queue Tier**: Redis (default: `redis://localhost:6379`) — required for rate limiting (ThrottlerStorageRedisService) and background job queue (Bull).
- **Core Engine**: Next.js 16.2.x utilizing Turbopack for sub-second development builds.
- **Backend Orchestration**: NestJS 11.x for scalable API services.

---

## 2. Infrastructure Initialization

Execute the following commands to provision the institutional development environment:

### Core Configuration (pnpm Monorepo)

```bash
# Clone the repository
git clone <repository-url>
cd pec-app

# Install ALL workspace dependencies at once (pnpm workspaces)
pnpm install

# One-command full setup (DB + Prisma + Seed)
pnpm run setup
```

### Individual Setup Steps

```bash
# Push database schema
pnpm --filter pec-server db:push

# Generate Prisma client types
pnpm --filter pec-server prisma:generate

# Seed with institutional data
pnpm --filter pec-server db:seed
```

### Institutional Environment Variables

The system utilizes isolated configurations for the frontend and backend tiers.

#### Frontend Specification (`apps/frontend/.env`)

Create a `.env` file in the `apps/frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

#### Backend API Specification (`apps/server/.env`)

Create a `.env` file in the `apps/server/` directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/pec_db"
JWT_SECRET="your_64_char_institutional_cryptographic_secret"
FIELD_ENCRYPTION_KEY="your_32_char_aes256_key"
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_TTL_DAYS=7
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key          # For AI completion endpoints (/ai/completion)
GITHUB_TOKEN=your_github_token         # Optional: for higher GitHub API rate limits
BACKGROUND_JOB_WORKER_ENABLED=true    # Enable Bull queue worker
AUTH_LOCK_THRESHOLD=5                  # Failed login attempts before account lock
AUTH_LOCK_MINUTES=15                   # Lock duration
REQUEST_BODY_LIMIT=1mb
```

# PEC APP - Institutional Development Lifecycle Guide

This document provides the definitive, long-form technical guidelines for contributing to and maintaining the PEC APP ERP ecosystem. Every developer must adhere to these standards to ensure institutional-grade performance, security, and scalability.

---

## 1. High-Fidelity Development Philosophy

At PEC, we build for **Institutional Persistence**. Our development philosophy is anchored by three core mandates:

- **Performance First**: If a page takes more than 500ms to hydrate, it is considered a performance regression.
- **Type-Safe Reciprocity**: Every data flow—from the database through the API to the UI—must be strictly typed.
- **Accessible Excellence**: Every interface must be intuitive, accessible, and responsive across all institutional hardware.

---

## 2. Institutional Coding Standards

### Frontend Ecosystem (React & Next.js)

- **Server-First Architecture**: Always default to Server Components. Only use `'use client'` for components requiring DOM APIs, complex state, or interactivity.
- **Atomic Component Design**: Break complex UIs into small, reusable atoms. Follow the directory structure:
  - `src/components/ui`: Atomic, headless components (Buttons, Inputs).
  - `src/components/shared`: Composed components used across multiple modules.
  - `src/app/(protected)/[module]/components`: Module-specific local components.
- **Tailwind Utility Strategy**: Use vanilla CSS for complex layouts and Tailwind for rapid utility styling. Ensure all colors use the institutional HSL tokens defined in `index.css`.

### Backend Orchestration (NestJS & Prisma)

- **Domain-Driven Modules**: Each institutional feature must reside in its own module directory with isolated controllers, services, and DTOs.
- **Validation Pipeline**: Never trust client-provided data. Use `class-validator` and `zod-nestjs` to enforce strict schema adherence at the API gateway.
- **Service Isolation**: Controllers are for request routing; all business logic must reside in injectable services.

---

## 3. Advanced State Management Patterns

### Server State Strategy (React Query / TanStack Query v5)

We utilize TanStack Query (React Query) to manage all asynchronous institutional data.

- **Prefetching**: Critical data for the next route should be prefetched in the current layout to ensure instantaneous transitions.
- **Optimistic Updates**: For low-risk mutations (like marking a notification as read), implement optimistic updates to provide an immediate UI response.
- **Granular Invalidation**: Use precise query keys (e.g., `['attendance', userId, courseId]`) to ensure the cache is only invalidated when necessary.
- **v5 Syntax**: Note that TanStack Query v5 (`^5.96.0`) uses `useQuery({ queryKey, queryFn })` — avoid deprecated v4 syntax like `useQuery(key, fn)`.

### Client State Strategy (Zustand & Context)

- **Zustand**: Used for heavy client-side state, such as managing the 3D topology camera position or active chat group metadata.
- **React Context**: Reserved for global UI settings like theme (Dark/Light) and sidebar collapse state.
- **next-themes**: The `ThemeProvider` from `next-themes` wraps the app root for dark/light mode persistence.

---

## 4. Performance Optimization Mandates

- **Turbopack Execution**: Always run `npm run dev` to leverage the Turbopack engine for hardware-accelerated development builds.
- **Dynamic Import Strategy**: Heavily complex components (like the 3D Map) must be loaded using `next/dynamic` to prevent bloating the initial bundle size.
- **Image Intelligence**: Use the `next/image` component for all institutional visual assets to ensure automatic WebP conversion and responsive resizing.
- **Hydration Boundary Optimization**: Wrap client-heavy sections in `Suspense` boundaries to allow the rest of the page to stream to the browser immediately.

---

## 5. Institutional Deployment Workflow

1. **Feature Engineering**: Develop the feature in a dedicated branch, adhering to the atomic component and domain-driven module standards.
2. **Relational Synchronization**: If the feature requires database changes, create a Prisma migration and update the institutional seed script in `apps/server/seed.ts`.
3. **Verification Audit**: Run the institutional test suite and verify that the build succeeds with zero TypeScript errors. Run `pnpm run build` to validate.
4. **Peer Review**: Submit a Pull Request. Every PR must be reviewed for performance impact and structural integrity.
5. **Phase-In Deployment**: Merged code is automatically deployed to the staging environment for institutional QA before entering production.

### Backend Start-Up Safety Script

The `apps/server/scripts/start-dev-safe.js` script is used by `npm run start:dev` instead of directly invoking `nest start`. It:

1. Checks if port 4000 is already occupied.
2. If a PEC API is already running on port 4000, it exits gracefully (reusing the existing process).
3. If another process owns port 4000, it exits with an error message instead of crashing.
4. Otherwise, launches `ts-node --transpile-only src/main.ts` for development hot-reload.

---

## 6. Advanced Troubleshooting and Logs

### Common Development Gotchas

- **"Hydration Mismatch"**: This usually occurs when a Server Component renders something different than the Client Component (e.g., using `new Date()` or `Math.random()`). Ensure such logic is moved to a `useEffect` or passed as a prop from the server.
- **"Prisma Client Not Generated"**: After updating the schema in `packages/database/prisma/schema.prisma`, you must run `pnpm --filter pec-server prisma:generate` to synchronize the TypeScript types.
- **"CORS Blocked"**: Ensure `CORS_ORIGINS` in `apps/server/.env` correctly includes the frontend's origin (e.g., `http://localhost:3000`). The CORS config is in `apps/server/src/config/` and applied in `app.setup.ts`.
- **"Port 4000 already in use"**: The `start-dev-safe.js` script handles this gracefully — if the PEC API is already running, it reuses it. If another process owns port 4000, run `netstat -ano | findstr :4000` (Windows) to find and kill it.
- **"Redis connection refused"**: Ensure Redis is running locally at `localhost:6379`. The server will fail to start if ThrottlerStorageRedisService cannot connect. Install Redis or use Docker: `docker run -p 6379:6379 redis`.
- **"Bull queue not processing"**: Ensure `BACKGROUND_JOB_WORKER_ENABLED=true` is set in `apps/server/.env` for the job worker to consume queued jobs.
- **"GitHub API rate limit"**: Add a `GITHUB_TOKEN` to `apps/server/.env` to increase the GitHub API rate limit from 60/hour to 5,000/hour for social sync features.

### Integrated Debugging

- **React DevTools**: Mandatory for inspecting the component hierarchy and hydration boundaries.
- **Prisma Studio**: Run `pnpm run db:studio` from the root for a visual editor of the institutional database during development.
- **NestJS Logger**: Utilize the built-in `Logger` service in backend providers to track service execution and catch silent failures.
- **pino-pretty**: In development mode (`NODE_ENV=development`), server logs are formatted with `pino-pretty` for human-readable output. In production, JSON logs are used.
- **Swagger API Docs**: The Swagger UI is available at `http://localhost:4000/api/docs` in development for exploring all endpoints.

---

## Technical Governance

- **System Standard**: PEC-DEV-v5
- **Last Updated**: June 2026
- **Registry**: PEC-DEV-LIFECYCLE-001
- **Authority**: PEC CTO Group
- **Maintained By**: PEC Development Group (June 2026)


## --- QUICK REFERENCE ---

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


## --- TOOLS GUIDE ---

# Tools

Utility scripts moved from repository root for better organization.

## Utility Scripts
- `detectCycles.js` - scans dependency/circular references
- `fix-imports.js` - bulk import cleanup helper
- `rebrand.js` - one-off rebranding utility
- `updateImports.js` - import path migration helper

## Manual Test Scripts
See [manual-tests](./manual-tests) for ad-hoc API/login test scripts.
