# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS builder
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace to just the frontend app and its dependencies
RUN turbo prune pec-frontend --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:22-alpine AS installer
WORKDIR /app

# First install dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Build the project and its dependencies
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json

# Generate Prisma
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

WORKDIR /app/apps/frontend
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}
RUN npx turbo run build --filter=pec-frontend...

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --link --from=installer /app/apps/frontend/public ./apps/frontend/public

# Automatically leverage output traces to reduce image size
COPY --link --from=installer --chown=1001:1001 /app/apps/frontend/.next/standalone ./
COPY --link --from=installer --chown=1001:1001 /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001

CMD ["node", "apps/frontend/server.js"]
