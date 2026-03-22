# OmniFow Architecture

## Overview

OmniFow uses a split architecture:

- Frontend: React + Vite + TypeScript (`src/`)
- Backend API: NestJS + Prisma (`server/src/`)
- Database: PostgreSQL via Prisma models and migrations (`server/prisma/`)
- Media: external cloud media provider configured through app settings

## Runtime Flow

1. Frontend authenticates with backend API.
2. Backend issues JWT tokens.
3. Frontend stores token and sends it in `Authorization` headers.
4. Backend guards protected routes and enforces role checks.
5. Prisma handles data access and schema mapping.

## Frontend Layers

- `src/pages/` and `src/features/`: route and feature UIs
- `src/components/`: reusable UI and layout
- `src/lib/postgres-bridge.ts`: API-compatible data bridge
- `src/lib/dataClient.ts`: neutral data client export used across app
- `src/features/auth/hooks/useAuth.ts`: auth/session orchestration

## Backend Layers

- `server/src/auth`: login, register, profile, role/profile completion
- `server/src/users`: user/profile reads and updates
- `server/src/*`: domain modules (courses, enrollments, attendance, jobs, chat, etc.)
- `server/src/prisma/prisma.service.ts`: Prisma connection lifecycle
- `server/prisma/schema.prisma`: canonical data model

## Data Model

Core entities include:

- `User`, `StudentProfile`, `FacultyProfile`
- `Course`, `Enrollment`, `Timetable`, `Assignment`, `Attendance`
- `ChatRoom`, `Message`, `UserChatRoom`
- `Book`, `BookBorrow`, `Room`, `Job`

## Performance Notes

- Route-level code splitting through lazy imports
- Prefetching for key sidebar routes
- Parallelized independent async requests where possible
- Deferred heavy imports on expensive screens

## Deployment

- Frontend: static hosting (Vercel/Netlify or equivalent)
- Backend: containerized NestJS service
- Database: managed PostgreSQL

Keep this document synchronized with `server/prisma/schema.prisma` and major frontend data-layer changes.
