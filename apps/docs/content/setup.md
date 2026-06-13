# PEC App - Setup Guide

This guide provides instructions for the installation, configuration, and local deployment of the PEC App platform.

---

## 1. Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v22 LTS (Recommended).
- **Package Manager**: pnpm v9+ (`npm install -g pnpm`).
- **Database**: PostgreSQL v16+ (Local or managed service).
- **Cache and Queue**: Redis (Default: `redis://localhost:6379`).
- **Operating System**: Windows, macOS, or Linux.

---

## 2. Initialization

### Clone the Repository

```bash
# Install pnpm if not already installed
npm install -g pnpm@9.12.3

# Clone the institutional master branch
git clone https://github.com/PECAPP/PEC
cd PEC
```

### Install Dependencies

The project utilizes a pnpm workspace monorepo. A single `pnpm install` at the root resolves all workspace dependencies simultaneously.

```bash
# Install all workspace dependencies (frontend + server + packages)
pnpm install
```

### One-Command Full Setup

```bash
# Install + push DB schema + generate Prisma client + seed data
pnpm run setup
# PEC App - Setup Guide

This guide provides instructions for the installation, configuration, and local deployment of the PEC App platform.

---

## 1. Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v22 LTS (Recommended).
- **Package Manager**: pnpm v9+ (`npm install -g pnpm`).
- **Database**: PostgreSQL v16+ (Local or managed service).
- **Cache and Queue**: Redis (Default: `redis://localhost:6379`).
- **Operating System**: Windows, macOS, or Linux.

---

## 2. Initialization

### Clone the Repository

```bash
# Install pnpm if not already installed
npm install -g pnpm@9.12.3

# Clone the institutional master branch
git clone https://github.com/PECAPP/PEC
cd PEC
```

### Install Dependencies

The project utilizes a pnpm workspace monorepo. A single `pnpm install` at the root resolves all workspace dependencies simultaneously.

```bash
# Install all workspace dependencies (frontend + server + packages)
pnpm install
```

### One-Command Full Setup

```bash
# Install + push DB schema + generate Prisma client + seed data
pnpm run setup
```

---

## 3. Environment Configuration

### A. Frontend Configuration (`apps/frontend/.env`)

Create a `.env` file in the `apps/frontend/` directory.

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000

# AI / Gemini
NEXT_PUBLIC_GEMINI_API_KEY=your_key
GEMINI_API_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### B. Backend Configuration (`apps/server/.env`)

Create a `.env` file in the `apps/server/` directory.

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/pec_db?schema=public"

# Auth
JWT_SECRET="your_64_char_institutional_cryptographic_secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_TTL_DAYS=7

# Field-Level Encryption for PII (AES-256-GCM)
FIELD_ENCRYPTION_KEY="your_32_char_aes256_gcm_key"

# Server
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
REQUEST_BODY_LIMIT=1mb
```

---

## 4. Database Setup

### Schema Synchronization

```bash
# From root (recommended)
pnpm --filter @pec/database push
pnpm --filter @pec/database generate

# Or from packages/database/ directory
cd packages/database
npx prisma db push
npx prisma generate
cd ../..
```

### Database Seeding

Run the seed script to populate the database with starter data. 
**Note**: The seed script performs a complete clean of the database, and then sequentially populates: Departments, Core College Admins (default password: `password123`), Faculty and Students with profiles, Courses, Academic Records (Attendance, Exams), the full Timetable, Campus Facilities (Hostels, Canteens), Noticeboard announcements, Chat/Communication history, Marketplace listings, and Finance records.

```bash
# From root (recommended)
pnpm --filter pec-server db:seed

# Or from apps/server/ directory
pnpm run db:seed
```

### Database Management Scripts

The server includes several database utility scripts in `apps/server/scripts/`:

- `db-backup.js` — Creates a PostgreSQL dump backup
- `db-restore.js` — Restores from a backup file
- `db-clean.js` — Wipes all data (requires `--force` flag)
- `migrate-sqlite-to-postgres.js` — Legacy migration utility

---

## 5. Running the Application

### Local Development

```bash
# Start both frontend and backend concurrently (kills port 3001 first)
pnpm run dev

# OR start individually
pnpm run frontend   # Next.js on port 3000
pnpm run api        # NestJS on port 4000
```

### Docker Compose Workflow (Optional)

#### Development Setup
If you prefer to run the development environment via Docker instead of local Node/PostgreSQL:

```bash
# Start backend and database only
docker compose -f docker-compose.dev.yml up -d

# Start backend, database, AND frontend
docker compose -f docker-compose.dev.yml --profile frontend up -d

# View live logs
docker compose -f docker-compose.dev.yml logs -f --tail=100

# Stop containers
docker compose -f docker-compose.dev.yml down
```

#### Production Setup
To run the production container stack:

```bash
# Start the full stack via Compose
pnpm run prod:docker

# Stop all services
pnpm run prod:docker:down
```

---

## 6. Verification Steps

1. **API Readiness Check**: Navigate to `http://localhost:4000/api/health` — expect `{"status":"ok"}`.
2. **Swagger API Docs**: Navigate to `http://localhost:4000/api/docs` to explore all endpoints.
3. **Prometheus Metrics**: Navigate to `http://localhost:4000/metrics` to verify Prometheus endpoint.
4. **Hydration Check**: Access the login portal at `http://localhost:3000` using seeded credentials.
5. **3D Campus Map Check**: Navigate to `/campus-map` to verify 3D Three.js rendering and 2D/3D toggle.
6. **AI Assistant Check**: Interact with 'Saathi' AI assistant to verify the Gemini API bridge.
7. **Real-time Sync Check**: Open two browser tabs in the `/chat` route and verify Socket.io message delivery.
8. **Redis Check**: Open the NestJS logs and confirm no Redis connection errors on startup.
9. **Feature Flags**: Log in as admin and navigate to the admin dashboard to verify the feature flags panel.

---

## 7. Troubleshooting & Common Fixes

- **Auth Loop Stuck on Dashboard**: Sometimes during development, updating files or restarting causes a stale Next.js cache issue resulting in an infinite authentication loop on the dashboard. **Fix**: Go to your browser's site settings, clear all site data (cookies and local storage), and log in again.
- **Database Connection Failure**: Verify PostgreSQL service status, host, and `DATABASE_URL` credentials.
- **Port Conflicts**: Ensure ports 3000, 4000, and 5432 are free. Use Resource Monitor to terminate conflicting node processes.
- **Prisma Client Errors**: If the backend cannot find the Prisma client, re-run `pnpm --filter @pec/database generate`.
- **Missing Env File**: Run `node scripts/check_env.js` from the root to verify all necessary environment variables are set.

---

## 8. Quick Start (Copy/Paste)

Assuming `.env.local` and `apps/server/.env` are created, paste this into your terminal from the root directory for a fresh start:

```bash
pnpm install
pnpm --filter @pec/database push
pnpm --filter @pec/database generate
pnpm --filter pec-server db:seed
pnpm run dev
```

---

## 9. Seeding & Mock Data Controls

The platform supports two distinct seeding methods depending on whether you are running a modular development reset or a larger simulation test.

### A. Modular Seeding (`seed.ts`)
The main seed script runs in 15 sequential stages to populate the database with starter data. It clears the database (unless bypassed by setting `SKIP_WIPE=true` in the environment) and populates:
1. **Clear Database**: Wipes transactional and user tables.
2. **Departments**: Seeds 5 base departments.
3. **Core Users**: Creates default administrative log-ins.
4. **Faculty**: Seeds professors and assigns HODs.
5. **Students**: Seeds students and creates profiles.
6. **Courses**: Sets up courses assigned to instructors.
7. **Academic Records**: Generates enrollment entries, attendance records, and exam timetables.
8. **Timetables**: Generates timetable periods.
9. **Campus Facilities**: Sets up hostel issues and canteen menus.
10. **Noticeboard**: Populates announcements.
11. **Communication**: Populates real-time chatrooms and message histories.
12. **Academic Calendar**: Populates semester events and holiday markers.
13. **Marketplace**: Populates peer-to-peer listings.
14. **Finance**: Populates fee records and invoices.
15. **Permissions**: Maps action/subject permissions to roles.

#### Seeded Credentials (Password for all: `password123`)
* **College Admin**: `admin@pec.edu` or `ops.admin@pec.edu`
* **HOD / Faculty**: `faculty@pec.edu`
* **Student**: `student@pec.edu`

### B. Development Scale Seeding (`seed-dev.ts`)
For scale/performance testing, running `npx tsx packages/database/scripts/seed-dev.ts` generates:
* **5 Departments** with randomized names.
* **20 Courses** with variable credit loads.
* **100 Fake Students** with random enrollments (each enrolled in 3 random courses).

---

## 10. WebSocket Event Registry

The real-time messaging subsystem utilizes Socket.io. Clients connect to the gateway and authenticate via JWT query parameters. The table below lists all events available in the chat module:

| Event Name | Direction | Payload Schema | Action / Side Effects |
| :--- | :---: | :--- | :--- |
| `joinRoom` | Client $\rightarrow$ Server | `roomId` (string) | Joins the client socket to the target room ID. Returns `{ event: "joinedRoom", roomId }`. |
| `leaveRoom` | Client $\rightarrow$ Server | `roomId` (string) | Removes the client socket from the room ID. Returns `{ event: "leftRoom", roomId }`. |
| `sendMessage` | Client $\rightarrow$ Server | `{ roomId: string, content: string }` | Saves the message to the DB, broadcasts `newMessage` to room. Returns the saved message entity. |
| `newMessage` | Server $\rightarrow$ Client | Message entity JSON payload | Broadcasts new messages in real-time to all clients joined in the room. |

---

## 11. RAG Vector Ingestion Guide

The platform uses **Qdrant** for Vector database indexing and the OpenAI embeddings model (`text-embedding-3-small`) to power context-grounded queries in the Saathi AI assistant.

### Vector Ingestion Mechanics
1. **Notice Processing**: Noticeboard announcements are parsed into plain text blocks.
2. **Embedding Generation**: Texts are vectorized using the OpenAI API (or GitHub models endpoint: `https://models.github.ai/inference`).
3. **Qdrant Storage**: Vectors are indexed in the `college_notices` Qdrant collection.
4. **RAG Search**: The `RagService` generates queries vectors and searches Qdrant for the top 3 matches using cosine similarity.

---

## 12. Redis & Background Jobs Register

The platform utilizes a dual background task architecture: a custom database-backed polling worker for scheduled operations and RabbitMQ for asynchronous queue jobs.

### A. Custom Database Poller (`BackgroundJobsService`)
A lightweight background loop polls the `BackgroundJob` table.
* **Poll Interval**: 5 seconds (configurable via `BACKGROUND_JOB_POLL_INTERVAL_MS`).
* **Stale Lock Timeout**: 60 seconds (re-queues processing jobs that crashed).
* **Job Retries**: Retries failed jobs with exponential backoff (`Math.min(60000, 2 ** attempts * 1000)`).

#### Standard Background Jobs
* **`audit-log.prune`**: Periodically deletes audit logs older than the configured `retentionDays` threshold (default: 30 days).
* **`attendance.check-low`**: Iterates through active student attendance records. If a student's calculated attendance percentage falls below the required threshold (e.g. 75%), a daily push notification warning is generated.

### B. RabbitMQ Worker Integration (`QueueService`)
Asynchronous queue workers handle heavy task offloading over RabbitMQ:
* **RabbitMQ Host**: `amqp://localhost:5672` (queue: `background_jobs_queue`).
* **DLX Configuration**: Integrates a Dead Letter Exchange (`dlx`) routing failed payloads to a Dead Letter Queue (`dead_letter`) for auditing.
* **Email Worker**: Listens for the `send-email` event to asynchronously process institutional emails.

---

## 13. Sentry & Prometheus Monitoring Setup

### A. Prometheus Metrics
The NestJS server integrates `@willsoto/nestjs-prometheus` to expose core metrics:
* **Metrics Endpoint**: `http://localhost:4000/metrics`
* **Scraped Metrics**: Node.js event loop lag, memory usage, heap garbage collection, and HTTP request durations.

### B. Sentry Error Capture
The global exception filter (`GlobalExceptionFilter`) acts as the capture boundary:
* **Dynamic Import**: To prevent bundle bloat, Sentry is loaded dynamically (`import('@sentry/node')`).
* **Filtering**: Only unhandled exceptions (status code $\ge$ 500) are reported to Sentry.

---

## 14. Performance Profiling Guide

To profile application bottlenecks and trace database queries during local development:

### A. OpenTelemetry (OTel) Tracing
OTel is initialized in `tracing.ts` before the NestJS bootstrapper loads.
* **Exporter**: Sends tracing payloads via HTTP to `http://localhost:4318/v1/traces`.
* **Telemetry Collector**: You can run an OpenTelemetry Collector or Jaeger container to visualize service spans.

### B. Database Query Profiling
Prisma logs queries using native adapters. To log all SQL queries executed against PostgreSQL to stdout, modify your Prisma client instantiation in `packages/database/src/index.ts` or set the debugging environment variable:
```bash
DEBUG="prisma:query" pnpm run dev
```

---

## 15. Git Hooks & Linting Standards

We enforce strict formatting rules to maintain repository cleanliness.

### A. Husky Pre-commit Hooks
The project installs Husky hooks (`.husky/pre-commit`) during setup. The pre-commit hook runs `lint-staged` which executes:
* Prettier formatting on modified files.
* Eslint verification on all staged code blocks.

### B. Linter Execution
To manually scan and auto-fix linter issues across the monorepo:
```bash
# Run linting on all apps and packages
pnpm run lint
```

---

## Appendix: Environment Variables Reference

### Frontend (`apps/frontend/.env`)
| Variable | Required | Default | Purpose |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:3000/api` | Base route for Next.js internal API rewrites to the backend. |
| `BACKEND_API_URL` | Yes | `http://localhost:4000` | Direct internal Docker/Server route to the NestJS API. |
| `NEXT_PUBLIC_SITE_URL` | Yes | `http://localhost:3000` | Base URL for the frontend application. |
| `NEXT_PUBLIC_GEMINI_API_KEY` | No | - | Allows Gemini AI requests directly from the client if needed. |

### Backend (`apps/server/.env`)
| Variable | Required | Default | Purpose |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Yes | - | Full connection string to the PostgreSQL database. |
| `JWT_SECRET` | Yes | - | High-entropy 64-char key for signing access and refresh tokens. |
| `FIELD_ENCRYPTION_KEY` | Yes | - | AES-256-GCM key used to encrypt PII in the database. |
| `PORT` | No | `4000` | The port the NestJS server will bind to. |
| `NODE_ENV` | No | `development` | Environment mode (`development`, `production`, `test`). |
| `CORS_ORIGINS` | Yes | `http://localhost:3000` | Comma-separated list of allowed origins. |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Connection string for the local Redis instance. |
| `OPENAI_API_KEY` | No | - | Required if using the OpenAI completion endpoints (Resume Analyzer). |
| `GEMINI_API_KEY` | No | - | Required for the RAG service and Saathi AI assistant responses. |
| `GITHUB_TOKEN` | No | - | Elevates the GitHub API rate limit for student portfolio sync. |
| `BACKGROUND_JOB_WORKER_ENABLED` | No | `true` | Set to false to disable Bull workers on this specific node. |
| `AUTH_LOCK_THRESHOLD` | No | `5` | Failed login attempts before account lockout. |
| `AUTH_LOCK_MINUTES` | No | `15` | Duration of account lockout. |
| `JWT_EXPIRES_IN` | No | `15m` | Token expiration duration (e.g., `15m`, `1h`). |
| `REFRESH_TOKEN_TTL_DAYS` | No | `7` | Refresh token duration in days. |
| `CORS_ALLOW_CREDENTIALS` | No | `true` | Boolean flag to allow sending cookies/credentials in CORS requests. |
| `REQUEST_BODY_LIMIT` | No | `1mb` | Maximum request payload size limit. |
