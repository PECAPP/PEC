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
