# PEC App - Technical Documentation

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![NestJS](https://img.shields.io/badge/NestJS-11-ea2845?style=for-the-badge&logo=nestjs)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-7-2d3748?style=for-the-badge&logo=prisma)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=for-the-badge&logo=typescript)

This document provides an overview of the system's architecture, operational capabilities, project highlights, and an end-to-end setup guide.

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Goals](#2-goals)
- [3. Core Feature Modules](#3-core-feature-modules)
- [4. Repository Architecture Overview](#4-repository-architecture-overview)
- [5. AI Integrations (Saathi Assistant)](#5-ai-integrations-saathi-assistant)
- [6. Security and Design Patterns](#6-security-and-design-patterns)
- [7. Technology Stack Specification](#7-technology-stack-specification)
- [8. Setup Guide](#8-setup-guide)
- [9. Verification Steps](#9-verification-steps)
- [10. Support and Maintenance](#10-support-and-maintenance)

---

## 1. Project Overview

PEC App is a comprehensive educational resource planning platform designed for the PEC University ecosystem. It consolidates academic and administrative management into a unified Next.js and NestJS monorepo.

The platform digitizes manual processes like roll-calls, admissions, and communication. By leveraging a Next.js 16/NestJS 11 stack backed by PostgreSQL, PEC App provides a highly responsive experience for thousands of concurrent users across the student and faculty bodies.

---

## 2. Goals

The platform is designed to achieve the following goals:

- **Digital Centralization**: Consolidation of all academic, logistic, and identity data into a single source of truth across all campus blocks.
- **Process Automation**: Eliminating manual data entry and paper-based processing across attendance and admissions lifecycles.
- **Data Insights**: Providing leaders with real-time KPI dashboards for informed decision-making.
- **Communication**: Establishing a secure channel for campus collaboration and data sharing.

---

## 3. Core Feature Modules

Each module within PEC App is a discrete domain-driven project.

###  Academic Management and Curriculum

- **Course Catalog**: Browse and manage courses with detailed relational metadata and prerequisite dependency maps for all departments.
- **Digital Course Materials**: A centralized repository for lecture notes and instructional resources with multi-version history and accessibility optimizations.
- **Timetable System**: Automated conflict-detection engine that optimizes 5,000+ weekly sessions, considering faculty availability and departmental constraints.
- **Digital Attendance Tracking**: Multi-modal roll-call system (QR-based or Manual via QR Session) with real-time student visibility and automated deficiency alerting. Faculty generate time-limited QR codes; students scan to validate presence.
- **Attendance Session Management**: Dedicated `attendance-session` module for creating, tracking, and closing QR-based attendance sessions per class.
- **Syllabus Management**: Faculty-driven curriculum management with lesson plans and objective tracking for accreditation readiness.
- **CGPA Entry System**: Dedicated module (`cgpa-entries`) for faculty to record and manage student CGPA/SGPA entries with a full CRUD repository layer.
- **Academic Calendar**: Full event scheduling, holiday management, and semester planning via the `academic-calendar` module with calendar view, event creation, and important date reminders.
- **Examinations Management**: Scheduling and management of examination timetables for all departments via the `examinations` module.
- **Enrollments**: Full student enrollment lifecycle management via the `enrollments` module.

###  Campus Logistics and Services

- **Hostel Infrastructure Management**: Standardized issue reporting with priority categorization and multimedia triage for rapid maintenance resolution.
- **Interactive 3D Campus Map**: A WebGL 3D digital twin of the campus using Three.js (`@react-three/fiber`, `@react-three/drei`) for building orientation and facility navigation. Supports a 2D/3D toggle on the campus map page.
- **Digital Canteen Ecosystem (Day & Night)**: Dual canteen system — `canteen` module for standard operations and `night-canteen` module for after-hours ordering — with real-time inventory-aware ordering and status tracking.
- **Campus Announcement Hub (Noticeboard)**: Target announcements to specific blocks or batches with scheduled publishing and engagement analytics.
- **Room Management**: Full CRUD for managing campus rooms including building, type, and availability tracking via the `rooms` module.

###  Community and Collaboration

- **Clubs Management**: Module for managing student clubs (`clubs`), supporting creation, membership, advisor assignment, and join requests.
- **Marketplace**: A peer-to-peer campus marketplace (`marketplace`) with listings, bookmarks, integrated chat between buyer/seller, and repository-level queries.
- **Real-Time Messaging (Chat)**: One-on-one and group chat via Socket.io with academic context (auto-created groups per batch/course).

###  Profile and Portfolio

- **Student Portfolio System**: Complete portfolio management (`student-portfolio`) with Projects tab (GitHub/live URLs, tech stack), Skills tab (categorized with proficiency), and GitHub Repo Sync via `/student-portfolio/github/sync`.
- **Faculty Bio System**: Rich professional profiles (`faculty-bio-system`) with Publications, Awards, Conferences, and Consultations sub-modules — each with full CRUD.
- **Social Sync**: GitHub and LinkedIn username sync (`social-sync`) for students — fetches GitHub repos server-side with optional `GITHUB_TOKEN` for higher rate limits.

###  Finance and Fee Management

- **Finance Module**: Tracks student fee records, transactions, and payment history via the `finance` module with a dedicated repository layer for complex fee queries.

###  Platform and Operations

- **Feature Flags**: Runtime feature toggle system (`feature-flags`) allowing admins to enable/disable platform features without redeployment.
- **Background Jobs**: Asynchronous job processing system (`background-jobs`) with Bull queue, retry logic, a dedicated worker, and job monitoring — handles audit log pruning, attendance threshold checks, and stale lock cleanup.
- **College Settings**: Centralized institutional configuration via the `college-settings` module.
- **Admin Module**: Comprehensive administrative dashboard and governance tools for super admins.
- **Prometheus Monitoring**: Application metrics exposed via `@willsoto/nestjs-prometheus` for production observability.

---

## 4. Repository Architecture Overview

The platform utilizes a **pnpm workspace monorepo** orchestrated by **Turborepo**, organized into logically isolated directories to facilitate modular growth and maintainability. Below is a high-level overview of the system's structural foundations:

###  Monorepo Workspace Structure

- **apps/frontend/**: The Next.js 16 App Router application housing all institutional interfaces, role-based dashboards, and client-side logic.
- **apps/server/**: The NestJS 11 backend API managing institutional business operations, academic records, and security logic.
- **packages/database/**: Prisma schema, migrations, and exported `@pec/database` client.
- **packages/shared/**: Zod schemas and TypeScript types exported as `@pec/shared`.
- **packages/env/**: Shared environment variable validation schemas and types exported as `@pec/env`.
- **packages/api/**: API client and React Query integration exported as `@pec/api`.
- **packages/ui/**: Reusable React components and UI shell exported as `@pec/ui`.

###  Frontend Architecture (`apps/frontend/src/`)

- **app/(protected)/**: All role-guarded routes — each feature (courses, attendance, clubs, marketplace, etc.) has its own Next.js directory.
- **components/ui/**: Atomic, headless components built on Radix-UI primitives (Button, Card, Input, Dialog, etc.).
- **features/** and **modules/**: Composed feature-level UI and business logic.
- **hooks/**: Custom React hooks for data fetching and UI state.
- **lib/**: API utilities, date formatters, and `cn()` class merging.

###  Backend API Orchestration (`apps/server/src/`)

All 36 domain-driven NestJS modules are registered in the central `AppModule`. Key modules include:

- **auth/**: Stateless JWT identity with refresh token rotation, account lockout, and RBAC guards.
- **attendance/** + **attendance-session/**: Roll-call logic with QR session management.
- **courses/**, **enrollments/**, **timetable/**, **examinations/**: Full academic lifecycle.
- **cgpa-entries/**: CGPA/SGPA recording with a dedicated repository layer.
- **academic-calendar/**: Academic event and holiday scheduling.
- **student-portfolio/**: Projects, skills, and GitHub repo sync.
- **faculty-bio-system/**: Publications, awards, conferences, and consultations.
- **social-sync/**: GitHub/LinkedIn profile synchronization.
- **marketplace/**: Campus peer-to-peer listings with integrated chat.
- **clubs/**: Student club management.
- **finance/**: Fee records and transaction tracking.
- **feature-flags/**: Runtime feature toggles for admins.
- **background-jobs/**: Bull-powered async job queue with retry and monitoring.
- **chat/**: Socket.io real-time messaging.
- **noticeboard/**, **campus-map/**, **hostel-issues/**, **canteen/**, **night-canteen/**, **rooms/**: Campus service modules.
- **ai/**: Google Gemini 2.5 Flash + OpenAI integration with a RAG (`rag.service.ts`) layer for context-enriched academic queries.
- **common/**: Global exception filter, input sanitization middleware, and request logging middleware.
- **config/**: Runtime configuration helpers (CORS, body size, production detection).

###  Operational Documentation Registry

- **docs/**: Centralized documentation registry — Architecture, Features, Development, Setup, Production Guide, Agents Guidelines, and Interconnection Audit.

---

## 5. AI Integrations (Saathi Assistant)

PEC App integrates AI models to provide intelligent assistance across the platform.

- **Saathi AI Student Assistant**: A post-login personalized assistant powered by Google Gemini 2.5 Flash, capable of answering academic queries and navigating platform features.
- **Landing Assistant**: A pre-login chatbot providing prospective students with admission info, campus tours, and facility details.
- **AI Integration**: Utilizing Google Gemini 2.5 Flash for natural language processing across support channels.
- **RAG (Retrieval-Augmented Generation) Layer**: The `rag.service.ts` integrates with Qdrant vector database (`@qdrant/js-client-rest`) to provide context-enriched, document-grounded answers from institutional knowledge bases.
- **OpenAI Support**: The `ai.service.ts` additionally supports OpenAI (`openai` npm package) for completion endpoints, enabling resume builder AI analysis and other LLM-powered features.
- **Resume Builder AI**: The `/ai/completion` endpoint powers the frontend ResumeAnalyzerPanel, providing AI-driven resume feedback and career suggestions.
- **Floating AI Chat Widget**: A persistent `FloatingAIChat` component available throughout the platform for always-on academic support.

---

## 6. Security and Design Patterns

The system implements several key patterns to ensure performance and security.

### 1. Role-Based Access Control (RBAC)

- **Granular Permissions**: Fine-grained access control across Super Admin, Faculty, and Student roles, preventing unauthorized access.
- **Dynamic UI Rendering**: Interfaces and navigation menus adapt instantaneously based on the user's active session role and department domain.
- **7 Role Types**: The system supports multiple role hierarchies — Student, Faculty, HOD, Admin, Super Admin, and more — each with precisely scoped data visibility and allowed operations.

### 2. Security Hardening (Already Implemented)

- **JWT + Refresh Token Rotation**: Access tokens (15min TTL) paired with refresh token reuse detection and session version tracking.
- **Account Lockout**: 5 failed attempts triggers a 15-minute account lock — configurable via `AUTH_LOCK_THRESHOLD` and `AUTH_LOCK_MINUTES` env vars.
- **Field-Level Encryption**: AES-256-GCM encryption for PII fields (phone, address, bio) via `FIELD_ENCRYPTION_KEY`.
- **Input Sanitization Middleware**: `InputSanitizationMiddleware` strips HTML injection and dangerous characters from every request.
- **Request Logging Middleware**: `RequestLoggingMiddleware` logs all API calls to the audit trail via `nestjs-pino`.
- **Rate Limiting**: Redis-backed Throttler — 100 req/min (short) and 1000 req/10min (long). Stricter limits on finance/payment routes.
- **Helmet Security Headers**: CSP, HSTS (1yr with preload in production), X-Frame-Options (deny), noSniff, referrer policy.
- **Superuser Database Blocking**: Production deployment refuses connections from privileged DB users (postgres, root, admin, sa).
- **Audit Logging**: All admin operations are logged to an immutable `AuditLog` model.

### 3. Real-Time Data Synchronization

- **Optimistic UI Updates**: Instant feedback with background synchronization to the backend API services to ensure zero perceived latency for the user.
- **Websocket Integration**: Real-time message delivery and system-wide notifications using Socket.io.

---

## 7. Technology Stack Specification

| Category                | Technology                        | Purpose                                                               |
| :---------------------- | :-------------------------------- | :-------------------------------------------------------------------- |
| **Frontend Framework**  | Next.js 16 + React 19             | Server-First App Router architecture with streaming SSR.              |
| **Backend Framework**   | NestJS 11 + Express/Fastify       | High-throughput API gateway with low-latency resolution.              |
| **Persistence**         | PostgreSQL 16 + Prisma 7          | Relational data integrity with migrations.                            |
| **Styling**             | Vanilla CSS + Tailwind CSS        | Custom institutional design system with high-contrast themes.         |
| **AI / Intelligence**   | Google Gemini 2.5 Flash + OpenAI  | AI chat assistant and resume analysis.                                |
| **Vector Search (RAG)** | Qdrant (`@qdrant/js-client-rest`) | Context-enriched RAG responses from institutional knowledge base.     |
| **Graphics / 3D**       | Three.js + @react-three/fiber     | 3D campus map with WebGL.                                             |
| **Real-Time**           | Socket.io (WebSocket)             | Real-time chat and live attendance synchronization.                   |
| **Job Queue**           | Bull + Redis (ioredis)            | Async background job processing with retry and monitoring.            |
| **Caching**             | Redis + cache-manager             | Server-side caching for high-frequency institutional queries.         |
| **Rate Limiting**       | @nestjs/throttler + Redis         | Redis-backed throttling at 100 req/min and 1000 req/10min.            |
| **Monitoring**          | Prometheus (`prom-client`)        | Application metrics endpoint for production observability.            |
| **Logging**             | nestjs-pino + pino-pretty         | Structured JSON logging with pretty-print for development.            |
| **Error Tracking**      | Sentry (@sentry/node)             | Unhandled exception capture and performance tracing.                  |
| **Microservices**       | gRPC (@grpc/grpc-js) + CQRS       | Proto-based inter-service communication and event bus.                |
| **Build System**        | Turbo (Turborepo) + pnpm          | Monorepo orchestration with task caching and parallelism.             |
| **Validation**          | Zod + class-validator             | Runtime type safety across the full stack.                            |
| **Auth**                | JWT + Bcrypt + Argon2             | Stateless session management with password hashing.                   |
| **File Handling**       | Multer + ExcelJS + jsPDF          | CSV/file uploads, spreadsheet exports, and PDF generation.            |

---

## 8. Setup Guide

### A. Infrastructure Prerequisites

- **Runtime Environment**: Node.js v22 (LTS) or higher.
- **Package Manager**: pnpm v9.12.3 (configured in `packageManager` field of root `package.json`).
- **Persistence Tier**: PostgreSQL v16 on Port 5432 with b-tree indexing support for academic records.
- **Caching / Queue Tier**: Redis (default: `redis://localhost:6379`) for rate limiting, caching, and Bull job queues.
- **Memory Allocation**: Minimum 8GB RAM; 16GB+ recommended for development with Turbopack.

### B. Installation

```bash
# Install pnpm globally if not present
npm install -g pnpm@9.12.3

# Clone and enter the repository
git clone <repository-url>
cd <repo-folder>

# Install ALL workspace dependencies in one command
pnpm install
```

### C. Custom Local Domain Setup (Optional)
To test the application locally using `pec.edu.in` instead of `localhost`, you can map the domain to your local machine. The codebase is already configured to natively accept traffic from both!

**Windows:**
1. Open Notepad as Administrator.
2. Open `C:\Windows\System32\drivers\etc\hosts`.
3. Add the following line at the bottom and save:
   `127.0.0.1 pec.edu.in`

**Mac/Linux:**
1. Open a terminal and run `sudo nano /etc/hosts`.
2. Add the following line at the bottom and save:
   `127.0.0.1 pec.edu.in`

Once set up, you can access the local environment via `http://pec.edu.in` in your browser.

### D. Quick One-Command Setup

```bash
# Provision DB, generate Prisma client, and seed in one step
pnpm run setup
```

Or step-by-step:

```bash
# Push schema to database
pnpm --filter @pec/database push

# Generate Prisma TypeScript client
pnpm --filter @pec/database generate

# Seed with institutional data
pnpm --filter pec-server db:seed
```

### D. Environment Variables

Create `.env` in `apps/server/` and `.env` in `apps/frontend/` according to the guidelines in [docs/SETUP.md]. The key variables for the backend are:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/pec_db
JWT_SECRET=your_64_char_secret
FIELD_ENCRYPTION_KEY=your_32_char_key
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key       # for AI completion endpoints
GITHUB_TOKEN=your_github_token      # optional, for higher GitHub API rate limits
```

### E. Development Server (Concurrent)

```bash
# Start frontend + backend simultaneously
pnpm run dev

# OR start individually:
pnpm run frontend   # Next.js on port 3000
pnpm run api        # NestJS on port 4000
```

### F. Database Management Commands

```bash
pnpm run db:reset        # Wipe DB, push schema, seed
pnpm run db:studio       # Visual Prisma Studio browser
```

---

## 9. Verification Steps

Once the services are active, verify the system status:

1. **API Readiness**: Navigate to `http://localhost:4000/api/health`. Expected response: `{"status": "ok"}`.
2. **Hydration Check**: Access the login portal at `http://localhost:3000`. Authenticate using the seeded credentials.
3. **Map Check**: Navigate to the Campus Map section. Verify that the Three.js 3D environment initializes building geometries.
4. **AI Check**: Interact with 'Saathi' AI assistant to verify the Gemini API bridge and context logic.

---

## 10. Support and Maintenance

### Contact

For support, please contact the PEC Development Team. All change requests must be submitted via pull request to maintain system integrity.

### Maintenance Protocols

- Health Check endpoints for real-time monitoring.
- Graceful degradation for AI services ensuring core academic functions remain active.

---
