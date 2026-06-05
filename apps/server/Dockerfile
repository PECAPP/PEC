# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS builder
# Set working directory
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune the workspace to just the backend server and its dependencies
RUN turbo prune pec-server --docker

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
COPY --from=builder /app/packages/protos ./packages/protos
COPY turbo.json turbo.json

# Generate Prisma
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

WORKDIR /app
ARG TURBO_TOKEN
ARG TURBO_TEAM
ENV TURBO_TOKEN=$TURBO_TOKEN
ENV TURBO_TEAM=$TURBO_TEAM
RUN npx turbo run build --filter=pec-server...

FROM node:22-alpine AS runner
WORKDIR /app/apps/server

ENV NODE_ENV=production

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
USER nestjs

# Copy dependencies and built files
COPY --link --from=installer --chown=1001:1001 /app/node_modules /app/node_modules
COPY --link --from=installer --chown=1001:1001 /app/apps/server/node_modules ./node_modules
COPY --link --from=installer --chown=1001:1001 /app/packages /app/packages
COPY --link --from=installer --chown=1001:1001 /app/apps/server/dist ./dist
COPY --link --from=installer --chown=1001:1001 /app/apps/server/package.json ./
COPY --link --from=installer --chown=1001:1001 /app/apps/server/tsconfig.json ./

EXPOSE 4000
EXPOSE 50051

CMD ["node", "-r", "tsconfig-paths/register", "dist/apps/server/src/main.js"]
