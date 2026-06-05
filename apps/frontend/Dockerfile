FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/database/package*.json ./packages/database/
COPY packages/protos/package*.json ./packages/protos/
RUN npm install --legacy-peer-deps

COPY packages ./packages
COPY apps/frontend ./apps/frontend

WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

WORKDIR /app/apps/frontend
ENV NODE_ENV=production
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/frontend/.next/static ./apps/frontend/.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001

CMD ["node", "apps/frontend/server.js"]
