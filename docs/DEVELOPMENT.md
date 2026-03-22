# Development Guide

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL (local or remote)

## Install

```bash
npm install
cd server
npm install
```

## Environment

Frontend `.env.local`:

```env
VITE_API_URL=http://localhost:3000
VITE_STORAGE_CLOUD_NAME=your_cloud_name
VITE_STORAGE_PRESET=your_upload_preset
VITE_GEMINI_API_KEY=your_gemini_key
```

Backend `server/.env`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=change_me
PORT=3000
```

## Database Setup

```bash
cd server
npm run db:deploy
npm run prisma:generate
npm run db:seed
```

If you have legacy local SQLite data in `server/prisma/dev.db` and want to move it to PostgreSQL:

```bash
cd server
npm run db:migrate-sqlite -- --sqlite ./prisma/dev.db --truncate
```

## Run Locally

Backend:

```bash
cd server
npm run start:dev
```

Frontend:

```bash
npm run dev
```

## Build

Frontend:

```bash
npm run build
```

Backend:

```bash
cd server
npm run build
```

## Notes

- All new data access should go through `src/lib/dataClient.ts`.
- Avoid introducing direct SDK-specific imports in app features.
- Keep Prisma schema, migrations, and seed data consistent.
