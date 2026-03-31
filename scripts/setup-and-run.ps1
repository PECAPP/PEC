# OmniFlow ERP Professional Setup & Run script
# This script automates the dependency installation, database synchronization, seeding, and execution of the entire stack.

Write-Host "🚀 INITIALIZING OMNIFLOW ERP PROFESSIONAL STACK..." -ForegroundColor Cyan

# 1. Front-end Dependencies (Root)
Write-Host "`n📦 Step 1: Installing Front-end Dependencies (Next.js 16/React 19)..." -ForegroundColor Yellow
npm install --legacy-peer-deps

# 2. Back-end Setup (Server)
Write-Host "`n⚙️ Step 2: Setting up Back-end Environment (NestJS/Prisma)..." -ForegroundColor Yellow
cd server

Write-Host "  - Installing server dependencies..."
npm install --legacy-peer-deps

Write-Host "  - Synchronizing Database Schema..."
npx prisma db push --accept-data-loss

Write-Host "  - Generating Prisma Client..."
npx prisma generate

Write-Host "  - Injecting Seed Data (Admin, Faculty, Students, Departments)..."
npm run db:seed

cd ..

# 3. Execution
Write-Host "`n✨ setup Complete! Launching Concurrent Dev Servers..." -ForegroundColor Green
Write-Host "  - Frontend: http://localhost:3000"
Write-Host "  - API Layer: http://localhost:8000"
Write-Host "  - Database: Connected via Prisma"

npm run dev
