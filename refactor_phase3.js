const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log("Starting phase 3 refactor (Database extraction, CI/CD, Next.js optimization)...");

function execCmd(cmd, cwd = process.cwd()) {
  console.log(`Executing: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd });
  } catch (e) {
    console.error(`Failed: ${cmd}`, e);
  }
}

function mv(src, dest) {
  if (fs.existsSync(src)) {
    fs.renameSync(src, dest);
    console.log(`Moved ${src} to ${dest}`);
  }
}

// 1. Extract packages/database
const dbPath = path.join('packages', 'database');
if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });

// Move prisma folder
const serverPrismaPath = path.join('apps', 'server', 'prisma');
if (fs.existsSync(serverPrismaPath)) {
  mv(serverPrismaPath, path.join(dbPath, 'prisma'));
}

// Create packages/database/package.json
const dbPkg = {
  name: "@pec/database",
  version: "0.0.0",
  private: true,
  main: "./dist/index.js",
  types: "./dist/index.d.ts",
  scripts: {
    "build": "tsc",
    "db:generate": "prisma generate",
    "db:push": "prisma db push --accept-data-loss",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "ts-node prisma/seed.ts"
  },
  dependencies: {
    "@prisma/client": "^6.4.1"
  },
  devDependencies: {
    "prisma": "^6.4.1",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.2"
  }
};
fs.writeFileSync(path.join(dbPath, 'package.json'), JSON.stringify(dbPkg, null, 2));

// Create packages/database/tsconfig.json
const dbTsConfig = {
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "dist",
    "declaration": true,
    "declarationMap": true
  },
  "include": ["index.ts"]
};
fs.writeFileSync(path.join(dbPath, 'tsconfig.json'), JSON.stringify(dbTsConfig, null, 2));

// Create packages/database/index.ts
const dbIndex = `import { PrismaClient } from '@prisma/client';
export * from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;
fs.writeFileSync(path.join(dbPath, 'index.ts'), dbIndex);

// Move seed if exists
const serverSeed = path.join('apps', 'server', 'seeds');
if (fs.existsSync(serverSeed)) {
  mv(serverSeed, path.join(dbPath, 'seeds'));
  // Update package.json seed script if we moved it
  dbPkg.scripts["db:seed"] = "ts-node seeds/seed.ts";
  fs.writeFileSync(path.join(dbPath, 'package.json'), JSON.stringify(dbPkg, null, 2));
}

// Update apps/server to use @pec/database
const serverPkgPath = path.join('apps', 'server', 'package.json');
if (fs.existsSync(serverPkgPath)) {
  let serverPkg = JSON.parse(fs.readFileSync(serverPkgPath, 'utf8'));
  if (!serverPkg.dependencies) serverPkg.dependencies = {};
  serverPkg.dependencies["@pec/database"] = "*";
  delete serverPkg.dependencies["@prisma/client"];
  delete serverPkg.devDependencies["prisma"];
  // remove old scripts
  delete serverPkg.scripts["db:push"];
  delete serverPkg.scripts["db:seed"];
  fs.writeFileSync(serverPkgPath, JSON.stringify(serverPkg, null, 2));
}

// Update apps/frontend to use @pec/database
const frontendPkgPath = path.join('apps', 'frontend', 'package.json');
if (fs.existsSync(frontendPkgPath)) {
  let frontendPkg = JSON.parse(fs.readFileSync(frontendPkgPath, 'utf8'));
  frontendPkg.dependencies["@pec/database"] = "*";
  // Add bundle analyzer
  frontendPkg.dependencies["@next/bundle-analyzer"] = "^15.1.7";
  fs.writeFileSync(frontendPkgPath, JSON.stringify(frontendPkg, null, 2));
}

// Update TS configs
['apps/frontend/tsconfig.json', 'apps/server/tsconfig.json'].forEach(tsPath => {
  if (fs.existsSync(tsPath)) {
    let ts = JSON.parse(fs.readFileSync(tsPath, 'utf8'));
    if (!ts.references) ts.references = [];
    if (!ts.references.find(r => r.path === '../../packages/database')) {
      ts.references.push({ path: "../../packages/database" });
    }
    if (ts.compilerOptions && ts.compilerOptions.paths) {
      ts.compilerOptions.paths["@pec/database"] = ["../../packages/database/index.ts"];
    }
    fs.writeFileSync(tsPath, JSON.stringify(ts, null, 2));
  }
});

// Update root package.json scripts
const rootPkgPath = 'package.json';
let rootPkg = JSON.parse(fs.readFileSync(rootPkgPath, 'utf8'));
rootPkg.scripts.setup = "npm install && npm --prefix packages/database run db:generate && npm --prefix packages/database run db:push && npm --prefix packages/database run db:seed";
fs.writeFileSync(rootPkgPath, JSON.stringify(rootPkg, null, 2));

// 2. Next.js optimizations
const nextAppPath = path.join('apps', 'frontend', 'src', 'app');
if (fs.existsSync(nextAppPath)) {
  // Add error.tsx
  const errorTsx = `'use client';
import { useEffect } from 'react';

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center space-y-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-red-500">{error.message}</p>
      <button onClick={() => reset()} className="px-4 py-2 bg-black text-white rounded">Try again</button>
    </div>
  );
}`;
  fs.writeFileSync(path.join(nextAppPath, 'error.tsx'), errorTsx);

  // Add loading.tsx
  const loadingTsx = `export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-black border-t-transparent"></div>
    </div>
  );
}`;
  fs.writeFileSync(path.join(nextAppPath, 'loading.tsx'), loadingTsx);
}

// Update next.config.mjs for bundle analyzer
const nextConfigPath = path.join('apps', 'frontend', 'next.config.mjs');
if (fs.existsSync(nextConfigPath)) {
  let nc = fs.readFileSync(nextConfigPath, 'utf8');
  if (!nc.includes('withBundleAnalyzer')) {
    nc = `import withBundleAnalyzerInit from '@next/bundle-analyzer';\n` + nc;
    nc = nc.replace('export default nextConfig;', `const withBundleAnalyzer = withBundleAnalyzerInit({ enabled: process.env.ANALYZE === 'true' });\nexport default withBundleAnalyzer(nextConfig);`);
    fs.writeFileSync(nextConfigPath, nc);
  }
}

// 3. GitHub Actions CI/CD
const ghDir = path.join('.github', 'workflows');
if (!fs.existsSync(ghDir)) fs.mkdirSync(ghDir, { recursive: true });

const ciYml = `name: CI

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install Dependencies
        run: npm ci

      - name: Turbo Cache
        uses: dtinth/setup-github-actions-caching-for-turbo@v1

      - name: Build, Lint, and Test
        run: npx turbo run build lint test
`;
fs.writeFileSync(path.join(ghDir, 'ci.yml'), ciYml);

// 4. Update Dockerfiles
const serverDocker = `FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY tsconfig*.json ./
COPY apps/server/tsconfig*.json ./apps/server/
COPY packages/shared/tsconfig*.json ./packages/shared/
COPY packages/database/tsconfig*.json ./packages/database/

COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/server ./apps/server

RUN npm install

WORKDIR /app/packages/database
RUN npm run db:generate
RUN npm run build

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/server
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/server/package.json ./apps/server/

USER node
EXPOSE 4000
CMD ["node", "apps/server/dist/src/main"]
`;
fs.writeFileSync(path.join('apps', 'server', 'Dockerfile'), serverDocker);

const frontendDocker = `FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/

RUN npm install

COPY tsconfig*.json ./
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY apps/frontend ./apps/frontend

WORKDIR /app/packages/database
RUN npm run db:generate
RUN npm run build

WORKDIR /app/packages/shared
RUN npm run build

WORKDIR /app/apps/frontend
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/apps/frontend/public ./apps/frontend/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs
EXPOSE 3001
ENV PORT 3001
CMD ["node", "apps/frontend/server.js"]
`;
fs.writeFileSync(path.join('apps', 'frontend', 'Dockerfile'), frontendDocker);

// Update docker-compose.yml to avoid issues
let dcStr = fs.readFileSync('docker-compose.yml', 'utf8');
dcStr = dcStr.replace('npx prisma db push --accept-data-loss && npm run db:seed && node dist/src/main', 'npm --prefix ../../packages/database run db:push && npm --prefix ../../packages/database run db:seed && node apps/server/dist/src/main');
fs.writeFileSync('docker-compose.yml', dcStr);

// Also rewrite turbo.json to include packages
const turboStr = `{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "db:generate": {
      "cache": false
    },
    "db:push": {
      "cache": false
    },
    "db:seed": {
      "cache": false
    }
  }
}`;
fs.writeFileSync('turbo.json', turboStr);

console.log("Phase 3 script generation complete!");
