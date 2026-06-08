# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && apk add --no-cache libc6-compat

FROM base AS fetcher
WORKDIR /app
COPY pnpm-lock.yaml ./
RUN pnpm fetch

FROM fetcher AS builder
WORKDIR /app
COPY . .
RUN pnpm install --offline --frozen-lockfile
# Generate Prisma
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
WORKDIR /app
RUN pnpm build --filter=pec-server && \
    pnpm --filter=pec-server deploy --prod /prod/pec-server

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs
USER nestjs
COPY --link --from=builder --chown=nestjs:nodejs /prod/pec-server .
EXPOSE 4000
EXPOSE 50051
CMD ["node", "dist/src/main.js"]
