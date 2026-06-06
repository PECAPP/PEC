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
