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
