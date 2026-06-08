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
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
WORKDIR /app
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:3000/api}
RUN pnpm build --filter=pec-frontend && \
    pnpm --filter=pec-frontend deploy --prod /prod/pec-frontend

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001
USER nextjs
COPY --link --from=builder /prod/pec-frontend/public ./public
COPY --link --from=builder --chown=nextjs:nodejs /prod/pec-frontend/.next/standalone ./
COPY --link --from=builder --chown=nextjs:nodejs /prod/pec-frontend/.next/static ./.next/static
EXPOSE 3001
ENV PORT=3001
CMD ["node", "server.js"]
