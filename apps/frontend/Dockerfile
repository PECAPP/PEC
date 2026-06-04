FROM node:20-alpine AS builder
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
