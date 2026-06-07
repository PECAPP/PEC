# PEC App - Institutional Setup and Operational Lifecycle

This definitive guide provides high-fidelity protocols for the installation, configuration, and operational deployment of the PEC App platform.

---

## 1. Institutional Prerequisites

Before initiating the deployment lifecycle, ensure the following localized or cloud-based infrastructure is available. These requirements are optimized for the PEC-ERP-v5 standard and have been tested for high-concurrency academic workloads.

### Minimum Technical Specification

- **Computational Environment**: Node.js v20.10.0 (LTS) or higher.
- **Package Orchestration**: pnpm v9.12.3 — configured in `packageManager` field of root `package.json`. Install via `npm install -g pnpm@9.12.3`.
- **Data Persistence**: PostgreSQL v16+ (Local instance or managed institutional service).
- **Cache and Queue**: Redis — required for ThrottlerStorageRedisService (rate limiting) and Bull (background job queue). Default: `redis://localhost:6379`.
- **Security Protocols**: Functional Git installation for version-controlled alignment.
- **Hardware Acceleration**: Minimum 16GB RAM recommended for development with Turbopack.
- **Operating System**: Windows 11 / Linux (Ubuntu 22.04 LTS+) / macOS Sonoma.

---

## 2. Infrastructure Initialization and Repository Synchronization

### Core Repository Synchronization

```bash
# Install pnpm if not already installed
npm install -g pnpm@9.12.3

# Clone the institutional master branch
git clone <repository-url>
cd pec-app
```

### Dependency Orchestration (pnpm Monorepo)

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

## 3. Institutional Configuration (Environment Security)

### A. Frontend Orchestration (`apps/frontend/.env`)

Provision a `.env` file in the `apps/frontend/` directory.

```env
# Institutional API Orchestration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000

# Intelligence Layer (Google Gemini 2.5 Flash)
NEXT_PUBLIC_GEMINI_API_KEY=your_key
GEMINI_API_KEY=your_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### B. Backend API Security (`apps/server/.env`)

Provision a `.env` file in the `apps/server/` directory.

```env
# Relational Persistence (PostgreSQL 16)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pec_db?schema=public"

# Authentication Security (Institutional High-Entropy Secret)
JWT_SECRET="your_64_char_institutional_cryptographic_secret"
JWT_EXPIRES_IN="15m"
REFRESH_TOKEN_TTL_DAYS=7

# Field-Level Encryption for PII (AES-256-GCM)
FIELD_ENCRYPTION_KEY="your_32_char_aes256_gcm_key"

# Server Operational Presets
PORT=4000
NODE_ENV=development
CORS_ORIGINS=http://localhost:3000
CORS_ALLOW_CREDENTIALS=true
REQUEST_BODY_LIMIT=1mb

# Redis (Rate Limiting + Bull Queue)
REDIS_URL=redis://localhost:6379

# AI Services
OPENAI_API_KEY=your_openai_key          # For /ai/completion endpoint
GITHUB_TOKEN=your_github_token         # Optional: GitHub API higher rate limits

# Background Jobs
BACKGROUND_JOB_WORKER_ENABLED=true

# Account Security
AUTH_LOCK_THRESHOLD=5
AUTH_LOCK_MINUTES=15
```

---

## 4. Database Engineering and High-Fidelity Seeding

### Schema Synchronization (Persistence Tier)

```bash
# From root (recommended)
pnpm --filter pec-server db:push
pnpm --filter pec-server prisma:generate

# Or from apps/server/ directory
npx prisma generate
npx prisma db push
```

### Data Hydration (Institutional Seeding)

Execute the high-fidelity seeding sequence to populate the database with foundational academic records and departments.

```bash
# From root (recommended)
pnpm --filter pec-server db:seed

# Or from apps/server/ directory
npm run db:seed
```

### Database Management Scripts

The server includes several database utility scripts in `apps/server/scripts/`:

- `db-backup.js` — Creates a PostgreSQL dump backup
- `db-restore.js` — Restores from a backup file
- `db-clean.js` — Wipes all data (requires `--force` flag)
- `migrate-sqlite-to-postgres.js` — Legacy migration utility

---

## 5. Operational Execution and Development Lifecycle

### Native Development Workflow (pnpm Monorepo)

```bash
# Start both frontend and backend concurrently (kills port 3001 first)
pnpm run dev

# OR start individually
pnpm run frontend   # Next.js on port 3000
pnpm run api        # NestJS on port 4000
```

### Containerized Environment (Docker/Portainer)

```bash
# Provision the full institutional stack via Compose
pnpm run prod:docker

# Stop all services
pnpm run prod:docker:down
```

---

## 6. Post-Deployment Verification Sequence

1. **API Readiness Check**: Navigate to `http://localhost:4000/api/health` — expect `{"status":"ok"}`.
2. **Swagger API Docs**: Navigate to `http://localhost:4000/api/docs` to explore all endpoints.
3. **Prometheus Metrics**: Navigate to `http://localhost:4000/metrics` to verify Prometheus endpoint.
4. **Hydration Check**: Access the login portal at `http://localhost:3000` using seeded credentials.
5. **Spatial Topology Loading**: Navigate to `/campus-map` to verify 3D Three.js rendering and 2D/3D toggle.
6. **Cognitive Loop Check**: Interact with 'Saathi' AI assistant to verify the Gemini API bridge.
7. **Real-time Sync Check**: Open two browser tabs in the `/chat` route and verify Socket.io message delivery.
8. **Redis Check**: Open the NestJS logs and confirm no Redis connection errors on startup.
9. **Feature Flags**: Log in as admin and navigate to the admin dashboard to verify the feature flags panel.

---

## 7. Institutional Troubleshooting and Maintenance Matrix

- **Database Connection Failure**: Verify PostgreSQL service status and `DATABASE_URL` credentials.
- **Port Conflicts**: Use Resource Monitor to terminate legacy node processes on ports 3000/4000.
- **Prisma Client Drift**: Re-execute `npx prisma generate` to synchronize the local TypeScript client.
- **Token Invalidation**: Ensure `JWT_SECRET` is identical across across all nodes.

---

## 8. Strategic Roadmap for System Maintenance

- **Daily Protocol**: Automated database snapshots and query log exports to encrypted off-site storage.
- **Weekly Protocol**: API performance profiling to identify any query paths showing latency.
- **Monthly Protocol**: Security patch reviews for all npm dependencies and Prisma schema optimizations.
- **Quarterly Protocol**: Institutional governance audit of user roles and access logs.

---

**Registry**: PEC-SETUP-OPS-002
**Operational Standard**: PEC-OPS-v5.0
**Document Version**: V2.6-STABLE
**Status**: ACTIVE
**Lines Targeted**: ~250

---

This guide is the setup manual for the PEC App platform.
All references to placements, recruiters, jobs, and finance have been purged.
EOF


## --- APPENDED FROM SETUP_GUIDE.md ---

PEC CAMPUS ERP - COMPLETE SETUP GUIDE (WINDOWS + CROSS-PLATFORM)
Date: 2026-04-03

This guide helps you run the complete project (frontend + backend + database).

======================================================================
1) PREREQUISITES
======================================================================

Install these first:
- Git
- Node.js 20.x LTS (recommended)
- npm (comes with Node.js)
- PostgreSQL 16+ (for local setup)
- Docker Desktop (optional, only for Docker setup)

Check versions:
- node -v
- npm -v
- git --version
- psql --version (if using local PostgreSQL)
- docker --version (if using Docker)

======================================================================
2) CLONE AND INSTALL DEPENDENCIES
======================================================================

From your terminal:

1. Clone and enter repo
   git clone <your-repo-url>
   cd PEC

2. Install root dependencies
   npm install --legacy-peer-deps

3. Install backend dependencies
   cd server
   npm install --legacy-peer-deps
   cd ..

Notes:
- This is a monorepo with root, server, and shared packages.
- Installing both root and server dependencies is required.

======================================================================
3) ENVIRONMENT FILES
======================================================================

You need 2 env files:
- .env.local (project root)
- server/.env

---------------------------------------------------------------------
3A) Create .env.local (ROOT)
---------------------------------------------------------------------

Create file: .env.local
Use this minimum config:

NEXT_PUBLIC_API_URL=http://localhost:3000
INTERNAL_API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

Optional values from .env.example (only if your feature needs them):
- NEXT_PUBLIC_UPI_ID
- NEXT_PUBLIC_UPI_NAME
- NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
- NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
- NEXT_PUBLIC_REMOVEBG_API_KEY
- GEMINI_API_KEY

Important:
- INTERNAL_API_URL should point to backend (http://localhost:4000)
- NEXT_PUBLIC_API_URL can stay http://localhost:3000 because Next.js rewrites /api to backend

---------------------------------------------------------------------
3B) Create server/.env (BACKEND)
---------------------------------------------------------------------

Create file: server/.env
You can start by copying server/.env.example, then edit values.

Minimum recommended local values:

NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/pec
JWT_SECRET=replace-with-a-long-random-secret

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
CORS_ALLOW_CREDENTIALS=true
CORS_MAX_AGE_SECONDS=86400
REQUEST_BODY_LIMIT=1mb

Optional but recommended hardening:
FIELD_ENCRYPTION_KEY=replace-with-a-separate-long-random-secret
CAPTCHA_BYPASS_TOKEN=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL_DAYS=7
AUTH_LOCK_THRESHOLD=5
AUTH_LOCK_MINUTES=15
REFRESH_COOKIE_NAME=refresh_token
FEATURE_FLAG_CACHE_TTL_MS=30000
BACKGROUND_JOB_WORKER_ENABLED=true
BACKGROUND_JOB_POLL_INTERVAL_MS=5000
BACKGROUND_JOB_STALE_LOCK_MS=60000

Optional AI keys (if using AI modules):
OPENAI_API_KEY=
GITHUB_AI_API_KEY=
GITHUB_TOKEN=

======================================================================
4) PREPARE DATABASE (LOCAL POSTGRES)
======================================================================

Make sure PostgreSQL is running and DB exists (example DB: pec).

Then run:

cd server
npx prisma generate
npx prisma db push --accept-data-loss
npm run db:seed
cd ..

What these do:
- prisma generate: generates Prisma client
- prisma db push: syncs schema to DB
- db:seed: inserts starter data

======================================================================
5) RUN THE FULL STACK (LOCAL)
======================================================================

Option A (recommended): run frontend + backend together
- From repo root:
  npm run dev:host

This starts:
- Frontend (Next.js): http://localhost:3000
- Backend (NestJS): http://localhost:4000

Option B: run separately in 2 terminals
- Terminal 1 (root): npm run frontend
- Terminal 2 (root): npm run api

======================================================================
6) VERIFY EVERYTHING IS WORKING
======================================================================

Open these URLs:
- Frontend app: http://localhost:3000
- Backend base route: http://localhost:4000/api
- Backend Swagger docs (dev mode): http://localhost:4000/api/docs

If frontend API calls fail, re-check:
- .env.local has INTERNAL_API_URL=http://localhost:4000
- server/.env has correct CORS_ORIGINS including localhost:3000
- backend is running on port 4000

======================================================================
7) DOCKER WORKFLOW (ALTERNATIVE)
======================================================================

If you prefer Docker instead of local PostgreSQL + local Node:

Production-style compose:
- docker compose up -d --build

Development compose:
- Backend + DB only:
  docker compose -f docker-compose.dev.yml up -d
- Include frontend profile too:
  docker compose -f docker-compose.dev.yml --profile frontend up -d

Useful logs:
- npm run dev:docker:logs

Stop containers:
- docker compose -f docker-compose.dev.yml down
- docker compose down

======================================================================
8) COMMON FIXES
======================================================================

1. Port already in use (3000/4000/5432)
- Stop conflicting process or change ports/env values.

2. Prisma client errors
- cd server
- npx prisma generate

3. DB auth/connection issues
- Verify DATABASE_URL credentials, host, and db name.
- Ensure PostgreSQL service/container is running.

4. Dependency conflicts
- Reinstall with:
  npm install --legacy-peer-deps
  cd server && npm install --legacy-peer-deps

5. Missing env file
- Quick check from root:
  npm run check:env

======================================================================
9) QUICK START (COPY/PASTE)
======================================================================

After creating .env.local and server/.env, run:

npm install --legacy-peer-deps
cd server
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push --accept-data-loss
npm run db:seed
cd ..
npm run dev:host

Then open: http://localhost:3000

End of guide.
