# PEC App - Institutional Setup and Operational Lifecycle

This definitive guide provides high-fidelity protocols for the installation, configuration, and operational deployment of the PEC App platform.

---

## 1. Institutional Prerequisites

Before initiating the deployment lifecycle, ensure the following localized or cloud-based infrastructure is available. These requirements are optimized for the PEC-ERP-v5 standard and have been tested for high-concurrency academic workloads.

### Minimum Technical Specification
- **Computational Environment**: Node.js v20.10.0 (LTS) or higher.
- **Package Orchestration**: npm v10.x or higher.
- **Data Persistence**: PostgreSQL v16+ (Local instance or managed institutional service).
- **Security Protocols**: Functional Git installation for version-controlled alignment.
- **Hardware Acceleration**: Minimum 16GB RAM recommended for development with Turbopack.
- **Operating System**: Windows 11 / Linux (Ubuntu 22.04 LTS+) / macOS Sonoma.

---

## 2. Infrastructure Initialization and Repository Synchronization

### Core Repository Synchronization
```bash
# Clone the institutional master branch
git clone <repository-url>
cd pec-campus-erp
```

### Dependency Orchestration (Monorepo Strategy)
The project utilizes a decoupled monorepo structure. Dependencies must be synchronized at both the root level and the server level to ensure shared Zod schemas are resolved correctly.

```bash
# 1. Root and Frontend orchestration
npm install

# 2. Backend API orchestration
cd server
npm install
```

---

## 3. Institutional Configuration (Environment Security)

### A. Frontend Orchestration (.env.local)
Provision a `.env.local` file in the root directory.

```env
# Institutional API Orchestration
NEXT_PUBLIC_API_URL=http://localhost:3000/api
BACKEND_API_URL=http://localhost:4000

# Intelligence Layer (Google Gemini 2.5 Flash)
NEXT_PUBLIC_GEMINI_API_KEY=your_key
```

### B. Backend API Security (server/.env)
Provision a `.env` file in the `server/` directory.

```env
# Relational Persistence (PostgreSQL 16)
DATABASE_URL="postgresql://postgres:password@localhost:5432/pec_db?schema=public"

# Authentication Security (Institutional High-Entropy Secret)
JWT_SECRET="institutional_cryptographic_secret"
JWT_EXPIRES_IN="7d"

# Server Operational Presets
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## 4. Database Engineering and High-Fidelity Seeding

### Schema Synchronization (Persistence Tier)
```bash
cd server
npx prisma generate
npx prisma db push
```

### Data Hydration (Institutional Seeding)
Execute the high-fidelity seeding sequence to populate the database with foundational academic records and departments.

```bash
# Provision Institutional Default Data via Prisma Seed
npm run seed
```

---

## 5. Operational Execution and Development Lifecycle

### Native Development Workflow (Turbopack Optimized)
```bash
# Terminal 1: Frontend and Shared Logic
npm run dev

# Terminal 2: Backend API Services
cd server && npm run start:dev
```

### Containerized Environment (Docker/Portainer)
```bash
# Provision the full institutional stack via Compose
docker-compose up --build
```

---

## 6. Post-Deployment Verification Sequence

1. **API Readiness Check**: Navigate to `http://localhost:4000/api/health`.
2. **Hydration Check**: Access the login portal at port 3000 using seeded credentials.
3. **Spatial Topology Loading**: Navigate to the Campus Map section to verify Three.js rendering.
4. **Cognitive Loop Check**: Interact with 'Saathi' AI assistant to verify the Gemini API bridge.
5. **Real-time Sync Check**: Verify chat events are distributed across multiple instances.

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
