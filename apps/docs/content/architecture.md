# PEC App - Architecture Overview

This document provides a technical overview for the PEC App platform. It details the architecture of the Next.js frontend and the NestJS backend, ensuring responsiveness and reliability.

---

## Request Lifecycle

The following sequence diagram outlines a typical authenticated request moving through the platform's layers:

```mermaid
sequenceDiagram
    participant C as Client (Next.js App Router)
    participant A as API Gateway (NestJS)
    participant M as Middleware / Guards
    participant S as Service / Domain Logic
    participant DB as Prisma (PostgreSQL)

    C->>A: HTTPS Request (JWT / Cookies)
    A->>M: Route to Controller
    M->>M: Input Sanitization & Auth/RBAC Guard check
    M->>S: Validated payload to Service layer
    S->>DB: Query / Mutation via Prisma Client
    DB-->>S: Raw Relational Data
    S->>S: Transform / Serialize Data
    S-->>A: Domain Entity
    A-->>C: JSON Response
```

---

## 1. Design Goals

The primary design goals include:

- **Responsiveness**: Leveraging Next.js Server Components to minimize FCP and TTI across all platform routes.
- **Scalability**: An API-first approach using JWT and RBAC to support horizontal scaling.
- **Relational Integrity**: Strict PostgreSQL data models enforced by Prisma to ensure data consistency.
- **Interactive Campus Map**: 3D rendering (WebGL/Three.js) integrated into the application.
- **Shared Contracts**: Shared type definitions and Zod schemas across the full stack to ensure consistency.
- **Service Isolation**: Domain-driven modules in the backend to ensure backend services fail independently without affecting the rest of the application.

---

## 2. System Topology

The platform utilizes a **pnpm workspace monorepo** managed by **Turborepo**:

```mermaid
graph TD
    Client["Web/Mobile Client"] -->|"HTTPS/TLS"| Frontend["Next.js Frontend"]
    Frontend -->|"Internal API Bridge"| Backend["NestJS Backend API"]
    Client -->|"REST API / WebSockets"| Backend
    
    subgraph "Backend Tier"
        Backend -->|"gRPC/REST"| Microservices["Internal Domain Modules"]
        Backend -->|"Cache/PubSub"| Redis[("Redis")]
        Backend -->|"Job Queue"| Bull["Bull Workers"]
    end
    
    subgraph "Data Persistence Tier"
        Backend -->|"Prisma Client"| DB[("PostgreSQL 16")]
        Microservices -->|"Prisma"| DB
    end
```

- **Frontend (`apps/frontend/`)**: A Next.js application with App Router, providing scalability to handle varying loads.
- **Backend API (`apps/server/`)**: Powered by NestJS 11.x on Express, managing academic records and business logic.
- **Data Persistence**: PostgreSQL 16 database managed via the `packages/database/` shared Prisma package.
- **Cache and Queue Tier**: Redis (`ioredis`) used for rate-limiting storage (ThrottlerStorageRedisService), Bull job queue persistence, and `cache-manager` server-side caching.
- **Shared Packages** (`packages/`): `@pec/database` (Prisma client), `@pec/shared` (Zod schemas and types), `@pec/env` (environment variables validation), `@pec/api` (API client hooks), and `@pec/ui` (shared UI components).

### Monorepo Workspace Dependency Graph

The visual tree below illustrates how applications and packages interconnect within our monorepo:

```mermaid
graph TD
    subgraph Applications
        A["apps/frontend (pec-frontend)"]
        B["apps/server (pec-server)"]
    end
    subgraph Packages
        DB["packages/database (@pec/database)"]
        SH["packages/shared (@pec/shared)"]
        EV["packages/env (@pec/env)"]
        AP["packages/api (@pec/api)"]
        UI["packages/ui (@pec/ui)"]
    end

    A -->|"imports Zod/types"| SH
    A -->|"validates envs"| EV
    A -->|"queries backend"| AP
    A -->|"shared UI components"| UI

    B -->|"Prisma Client queries"| DB
    B -->|"imports Zod/types"| SH
    B -->|"validates envs"| EV

    AP -->|"maps contracts"| SH
    UI -->|"styles/types"| SH
    DB -->|"generates"| DBClient["Local Prisma Client"]
```

---

## 3. Security Architecture

PEC App implements standard security practices.

### Authentication and Identity Verification

- **Credential Protection**: Passwords and sensitive identifiers are protected using high-entropy hashing algorithms (Bcrypt cost 12), making it computationally infeasible to recover original credentials.
- **Session-less Management**: Access tokens (JWT, 15-minute TTL) paired with refresh token rotation and reuse detection. Session version tracking invalidates all tokens on password change.
- **Account Lockout**: 5 consecutive failed login attempts triggers a 15-minute lock — configurable via `AUTH_LOCK_THRESHOLD` and `AUTH_LOCK_MINUTES` environment variables.
- **MFA Capability**: The architecture is built to support Multi-Factor Authentication for administrative and faculty roles.

### Refresh Token Rotation Sequence (Stateless)

The NestJS backend supports secure refresh token rotation to maintain stateless user sessions. When a client requests an access token refresh, the server validates the opaque token, checks for reuse, and issues a new pair:

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (Next.js)
    participant G as AuthGuard / Controller
    participant S as AuthService (NestJS)
    participant DB as PostgreSQL (Prisma)
    
    C->>G: POST /api/v1/auth/refresh (refresh_token payload)
    G->>S: refreshSession(refreshTokenRaw)
    S->>S: Hash the raw token
    S->>DB: Find token by hash
    DB-->>S: Token record (with User & FamilyId)
    
    alt Token is Revoked (Abuse Detection)
        Note over S, DB: Reuse detected! Revoke family & force user log out
        S->>DB: Revoke all tokens with familyId (revokedAt = now)
        S->>DB: Increment User.sessionVersion in DB
        S-->>G: Throw UnauthorizedException (Refresh token reuse detected)
        G-->>C: 401 Unauthorized
    else Token is Expired
        S-->>G: Throw UnauthorizedException (Refresh token expired)
        G-->>C: 401 Unauthorized
    else Token is Valid
        S->>S: Generate new opaque refresh token & hash
        S->>DB: Create new RefreshToken (same FamilyId, active)
        S->>DB: Revoke old RefreshToken (revokedAt = now)
        S->>DB: Link replacement (replacedByTokenId = new token ID)
        S->>S: Sign new JWT with User.sessionVersion (sv claim)
        S-->>G: Return Access Token & new Refresh Token
        G-->>C: Set cookies / JSON body payload
    end
```

### Data Protection and Compliance

- **Encryption at Transit**: All network communications between the browser and the API use TLS 1.3 encryption protocols with HSTS headers (1-year max-age with preload in production).
- **Field-Level Encryption**: PII fields (phone, address, bio) are encrypted via AES-256-GCM using a dedicated `FIELD_ENCRYPTION_KEY` — separate from the JWT secret.
- **Sub-Second Guarding**: Every client request carries a secure, HMAC-signed JWT validated at the API edge before any business operation is executed.
- **Superuser DB Blocking**: Production startup verifies the DATABASE_URL does not use privileged users (postgres, root, admin, sa).

### Middleware Security Chain

1. **Helmet** (`app.setup.ts`): Sets CSP, HSTS, X-Frame-Options (deny), noSniff, referrer-policy, removes `x-powered-by`.
2. **InputSanitizationMiddleware**: Strips HTML tags and injection patterns from all incoming request bodies.
3. **RequestLoggingMiddleware**: Logs all requests to `nestjs-pino` structured JSON output.
4. **ThrottlerGuard** (Global): Redis-backed rate limiting — 100 req/min (short), 1000 req/10min (long).
5. **GlobalExceptionFilter**: Catches all unhandled exceptions and formats consistent error responses with Sentry integration.

### Standardized Error Responses & Exception Mapping

The platform utilizes a global exception filter (`GlobalExceptionFilter`) to sanitize outgoing error payloads. In production, stack traces are stripped, and server errors (HTTP 500) trigger Sentry trace reporting.

#### Standard Error Response Envelope
```json
{
  "success": false,
  "error": {
    "message": "Unique constraint violation",
    "statusCode": 409
  },
  "requestId": "req-xyz-123",
  "timestamp": "2026-06-09T10:00:00.000Z",
  "path": "/api/v1/users/register",
  "method": "POST"
}
```

#### Database Error Mappings (Prisma to HTTP Status)
The filter intercepts ORM-level exceptions and normalizes them into clean client responses:
| Prisma Code | Exception Type | HTTP Status | Returned Client Message |
| :--- | :--- | :---: | :--- |
| `P2002` | Unique Constraint Failure | `409 Conflict` | `"Unique constraint violation"` |
| `P2025` | Target Record Not Found | `404 Not Found` | `"Record not found"` |
| Other `P2xxx` | General Query Failures | `400 Bad Request` | `"Database operation failed"` |
| - | Internal Runtime Error | `500 Server Error` | `"Internal server error"` (Triggers Sentry call) |

---

## 4. Role-Based Access Control (RBAC)

The system defines three distinct roles with carefully scoped permissions and data visibility.

| Role        | Data Scope Visibility                                          | Typical Allowed Actions                                                 | Restrictions                                |
| :---------- | :------------------------------------------------------------- | :---------------------------------------------------------------------- | :----------------------------------------------------------------- |
| **Student** | Own profile and academic enrollment records                    | Enrollment updates, personal attendance, support tickets, 3D navigation | No access to other students' data or institutional policy settings |
| **Faculty** | Assigned courses, teaching dashboards, and departmental groups | Mark attendance, manage curriculum communications, publish materials    | No institution-wide user management capabilities                   |
| **Admin**   | Institution-wide operational modules and governance logs       | Manage users and departments, configure schedules, monitor dashboards   | All sensitive actions are logged to an immutable audit trail       |

### Seeded RBAC Action/Subject Matrix

Granular capabilities are mapped to CASL subjects during database seeding (`seed_rbac.ts`). Allowed operations are mapped as follows:

| Subject | Student Role Permissions | Faculty Role Permissions | Admin / HOD Role Permissions |
| :--- | :--- | :--- | :--- |
| **User** | `read` (own details), `update` (own details) | `read`, `update` (own details) | `manage` (full CRUD on all users) |
| **HostelIssue** | `read`, `create`, `update` (own), `delete` (own) | - | `manage` (full CRUD on all issues) |
| **MarketplaceListing** | `read`, `create`, `update` (own), `delete` (own) | - | `manage` (full CRUD on all listings) |
| **FeeRecord** | `read` (own fees only) | - | `manage` (full CRUD on all records) |
| **Timetable** | `read` | `read`, `update`, `create`, `delete` | `manage` (full CRUD) |
| **Course** | `read` | `read`, `update`, `create`, `delete` | `manage` (full CRUD) |
| **CourseMaterial** | `read`, `create`, `update` (own), `delete` (own) | `read`, `create`, `update` (own), `delete` (own) | `manage` (full CRUD) |

---

## 5. Database and Integrity

### Data Modeling

The system utilizes a strictly typed PostgreSQL schema:

- **Prisma Package**: The Prisma schema and client are housed in `packages/database/` and exported as `@pec/database`, ensuring the server always uses the same generated client.
- **Prisma Client Generation**: Post-migration, the Prisma engine generates a local TypeScript client, ensuring that backend services can only interact with the database via type-safe methods.
- **Performance Benchmarks**: Query resolution remains consistent at <15ms due to hardware-accelerated b-tree indexing on primary academic keys.
- **Relation Enforcement**: Cascading deletes and strict foreign keys prevent orphaned records in student and course tables.
- **51 Prisma Models**: The schema defines 51 models across Core, Auth, Academic, Attendance, Finance, Campus, Community, Marketplace, Portfolio, Notification, and System domains.
- **Prisma Migrate in Production**: Production uses `prisma migrate deploy` (not `db push`) for auditable migration history.
- **Read Replicas**: The `@prisma/extension-read-replicas` package is installed for future horizontal read scaling.
- **Pg Adapter**: Uses `@prisma/adapter-pg` for native PostgreSQL driver integration with connection pooling support.

### Core Database Schema Entity-Relationship Diagram (ERD)

The entity relationships for the primary domain tables of the PEC App database schema are defined as follows:

```mermaid
erDiagram
    USER ||--o| STUDENT_PROFILE : "has student profile"
    USER ||--o| FACULTY_PROFILE : "has faculty profile"
    USER ||--o{ USER_ROLE : "has roles"
    ROLE ||--o{ USER_ROLE : "mapped to user"
    ROLE ||--o{ ROLE_PERMISSION : "defines permissions"
    PERMISSION ||--o{ ROLE_PERMISSION : "defines permissions"
    USER ||--o{ REFRESH_TOKEN : "owns active sessions"
    USER ||--o{ ATTENDANCE : "has records"
    USER ||--o{ ENROLLMENT : "is enrolled in"
    COURSE ||--o{ ENROLLMENT : "has students"
    COURSE ||--o{ TIMETABLE : "scheduled sessions"
    
    USER {
        string id PK
        string email UK
        string password
        string name
        int sessionVersion
        datetime passwordChangedAt
    }
    STUDENT_PROFILE {
        string id PK
        string userId FK
        string enrollmentNumber UK
        string department
        int semester
    }
    FACULTY_PROFILE {
        string id PK
        string userId FK
        string employeeId UK
        string department
        string designation
    }
    REFRESH_TOKEN {
        string id PK
        string tokenHash UK
        string familyId
        string userId FK
        datetime expiresAt
        datetime revokedAt
    }
    ATTENDANCE {
        string id PK
        string studentId FK
        string status "present | absent | late"
        datetime date
    }
    COURSE {
        string id PK
        string code UK
        string name
        int credits
        string department
    }
    ENROLLMENT {
        string studentId PK, FK
        string courseId PK, FK
        int semester
    }
```

---

## 6. Infrastructure

### State Synchronization Strategy

We utilize a multi-layered synchronization approach to ensure all stakeholders see consistent data:

- **Database-Level Triggers**: Real-time updates to enrollment counts are triggered at the persistence level.
- **Websockets (Socket.io)**: Collaborative events, such as Chat messages or Maintenance status updates, are pushed to clients with sub-100ms latency.
- **Multi-Tenant Potential**: The architecture supports multi-institutional deployment through isolated database schema-switching.

### Redis Infrastructure

- **Rate Limiting**: ThrottlerStorageRedisService uses Redis for distributed rate limiting across multiple server instances.
- **Job Queue**: Bull uses Redis as the persistence backend for the `background-jobs` async queue.
- **Caching**: `cache-manager` with Redis store provides server-side caching for high-frequency read queries.
- **Default URL**: `redis://localhost:6379` — configurable via `REDIS_URL` environment variable.

### CQRS and Event Bus

- **CqrsModule**: The NestJS `@nestjs/cqrs` module is registered in the `AppModule`, enabling Command/Query Responsibility Segregation for complex business operations.
- **Event-Driven**: Domain events can be published and subscribed to by different modules without tight coupling.

### gRPC Microservices

- **gRPC Transport**: `@grpc/grpc-js` and `@grpc/proto-loader` are installed for inter-service proto-based communication.
- **NestJS Microservices**: `@nestjs/microservices` enables hybrid REST + gRPC service architecture.

### Observability Stack

- **Prometheus**: `@willsoto/nestjs-prometheus` exposes a `/metrics` endpoint for Prometheus scraping.
- **Sentry**: `@sentry/node` + `@sentry/profiling-node` capture unhandled exceptions and performance traces in production.
- **Structured Logging**: `nestjs-pino` + `pino-http` with `pino-pretty` for development pretty-print.
- **Audit Logs**: All admin actions are persisted in the `AuditLog` model — pruned by background job on a schedule.

---

## 7. Directory Structure

The architecture is reflected in the following directory organization:

**Monorepo Root**

- **`apps/frontend/`** (Next.js 16): Domain-driven navigation and interface orchestration layer.
  - **`src/app/(protected)/`**: Routes requiring active institutional JWT authentication.
  - **`src/app/api/`**: Next.js API route proxies for server-to-server calls.
  - **`src/components/`**: Atomic and composed UI components built on Radix-UI.
  - **`src/features/`** + **`src/modules/`**: Feature-level UI and business logic.
  - **`src/hooks/`**: TanStack Query hooks and custom React hooks.
  - **`src/lib/`**: Utilities, API client, and formatters.

**Backend** (`apps/server/src/`)

- **`auth/`**: Stateless JWT security module, RBAC guards, refresh token rotation.
- **`users/`**: User identity lifecycle management.
- **`attendance/`** + **`attendance-session/`**: Roll-call and QR session management.
- **`courses/`**, **`enrollments/`**, **`timetable/`**, **`examinations/`**: Academic lifecycle.
- **`cgpa-entries/`**: CGPA/SGPA academic performance records.
- **`academic-calendar/`**: Event and holiday scheduling.
- **`course-materials/`**: Digital learning resource repository.
- **`noticeboard/`**: Campus announcements and targeted notices.
- **`chat/`**: Socket.io real-time institutional messaging.
- **`hostel-issues/`**: Maintenance triage lifecycle.
- **`canteen/`** + **`night-canteen/`**: Dual canteen ordering systems.
- **`campus-map/`**: Spatial data for 2D/3D campus visualization.
- **`rooms/`**: Room inventory and availability management.
- **`clubs/`**: Student club lifecycle.
- **`marketplace/`**: Peer-to-peer listings with integrated chat.
- **`finance/`**: Fee records and transaction tracking.
- **`student-portfolio/`**: Projects, skills, and GitHub sync.
- **`faculty-bio-system/`**: Publications, awards, conferences, consultations.
- **`social-sync/`**: GitHub/LinkedIn username sync.
- **`ai/`**: Gemini + OpenAI + Qdrant RAG intelligence layer.
- **`feature-flags/`**: Runtime feature toggle system.
- **`background-jobs/`**: Bull-powered async job queue with retry and monitoring. Workers process heavy background tasks asynchronously (e.g., pruning stale audit logs every night at midnight, recalculating student attendance thresholds, and firing off batch notifications).
- **`admin/`**: Administrative governance and dashboard.
- **`college-settings/`**: Institutional configuration.
- **`departments/`**: Department management.
- **`common/`**: Global exception filter, sanitization, and request logging middleware.
- **`config/`**: Runtime environment and CORS configuration helpers.
- **`prisma/`** (module): NestJS Prisma service wrapper.

**Shared Packages** (`packages/`)

- **`packages/database/`**: Prisma schema, migrations, and exported `@pec/database` client.
- **`packages/shared/`**: Zod schemas and TypeScript types exported as `@pec/shared`.
- **`packages/env/`**: Type-safe environment variable schemas and validation exported as `@pec/env`.
- **`packages/api/`**: Automatically generated frontend API client wrappers exported as `@pec/api`.
- **`packages/ui/`**: Shared design system components and utilities exported as `@pec/ui`.
