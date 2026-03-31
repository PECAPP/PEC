# PEC APP - Institutional Development and Operational Lifecycle

A comprehensive guide to the institutional development lifecycle, environment orchestration, and deployment protocols for the PEC APP ERP platform.

## 1. System Prerequisites

The following infrastructure must be provisioned before initiating the development lifecycle:

- **Computational Architecture**: Node.js v20.10.0 (LTS) or higher.
- **Package Management**: npm v10.x or Bun v1.1.x for high-performance dependency resolution.
- **Relational Persistence**: PostgreSQL v16+ (Local or managed).
- **Core Engine**: Next.js 16.2.1 utilizing Turbopack for sub-second development builds.
- **Backend Orchestration**: NestJS 11.x for scalable API services.

---

## 2. Infrastructure Initialization

Execute the following commands to provision the institutional development environment:

### Core Configuration
```bash
# Clone the repository
git clone <repository-url>
cd pec-app

# Provision frontend and root dependencies
npm install

# Provision backend API dependencies
cd server
npm install
```

### Institutional Environment Variables

The system utilizes isolated configurations for the frontend and backend tiers.

#### Frontend Specification (`.env.local`)
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
```

#### Backend API Specification (`server/.env`)
Create a `.env` file in the `server/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/pec_db"
JWT_SECRET="institutional_cryptographic_secret"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
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

### Server State Strategy (React Query)
We utilize TanStack Query (React Query) to manage all asynchronous institutional data.
- **Prefetching**: Critical data for the next route should be prefetched in the current layout to ensure instantaneous transitions.
- **Optimistic Updates**: For low-risk mutations (like marking a notification as read), implement optimistic updates to provide an immediate UI response.
- **Granular Invalidation**: Use precise query keys (e.g., `['attendance', userId, courseId]`) to ensure the cache is only invalidated when necessary.

### Client State Strategy (Zustand & Context)
- **Zustand**: Used for heavy client-side state, such as managing the 3D topology camera position or active chat group metadata.
- **React Context**: Reserved for global UI settings like theme (Dark/Light) and sidebar collapse state.

---

## 4. Performance Optimization Mandates

- **Turbopack Execution**: Always run `npm run dev` to leverage the Turbopack engine for hardware-accelerated development builds.
- **Dynamic Import Strategy**: Heavily complex components (like the 3D Map) must be loaded using `next/dynamic` to prevent bloating the initial bundle size.
- **Image Intelligence**: Use the `next/image` component for all institutional visual assets to ensure automatic WebP conversion and responsive resizing.
- **Hydration Boundary Optimization**: Wrap client-heavy sections in `Suspense` boundaries to allow the rest of the page to stream to the browser immediately.

---

## 5. Institutional Deployment Workflow

1. **Feature Engineering**: Develop the feature in a dedicated branch, adhering to the atomic component and domain-driven module standards.
2. **Relational Synchronization**: If the feature requires database changes, create a Prisma migration and update the institutional seed script.
3. **Verification Audit**: Run the institutional test suite and verify that the build succeeds with zero TypeScript errors.
4. **Peer Review**: Submit a Pull Request. Every PR must be reviewed for performance impact and structural integrity.
5. **Phase-In Deployment**: Merged code is automatically deployed to the staging environment for institutional QA before entering production.

---

## 6. Advanced Troubleshooting and Logs

### Common Development Gotchas
- **"Hydration Mismatch"**: This usually occurs when a Server Component renders something different than the Client Component (e.g., using `new Date()` or `Math.random()`). Ensure such logic is moved to a `useEffect` or passed as a prop from the server.
- **"Prisma Client Not Generated"**: After updating the schema, you must run `npx prisma generate` to synchronize the TypeScript types with the new database structure.
- **"CORS Blocked"**: Ensure the backend's `main.ts` correctly includes the frontend's origin in the CORS configuration.

### Integrated Debugging
- **React DevTools**: Mandatory for inspecting the component hierarchy and hydration boundaries.
- **Prisma Studio**: Run `npx prisma studio` for a visual editor of the institutional database during development.
- **NestJS Logger**: Utilize the built-in `Logger` service in backend providers to track service execution and catch silent failures.

---

## Technical Governance

- **System Standard**: PEC-DEV-v4
- **Last Updated**: March 2026
- **Registry**: PEC-DEV-LIFECYCLE-001
- **Authority**: PEC CTO Group
- **Maintained By**: PEC Development Group (March 2026)
