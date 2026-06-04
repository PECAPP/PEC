FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifests
COPY package*.json ./
COPY apps/server/package*.json ./apps/server/
COPY packages/database/package*.json ./packages/database/
COPY packages/shared/package*.json ./packages/shared/
COPY packages/protos/package*.json ./packages/protos/

# Install dependencies at root
RUN npm install

# Copy all source
COPY packages ./packages
COPY apps/server ./apps/server

# Generate Prisma and Build NestJS
WORKDIR /app/packages/database
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

WORKDIR /app/apps/server
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/apps/server

ENV NODE_ENV=production

# Copy node modules and generated prisma client
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/server/node_modules /app/apps/server/node_modules
COPY --from=builder /app/packages /app/packages

# Copy built dist and necessary package files
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/package.json ./

# Switch to non-root user for security
USER node

EXPOSE 4000
EXPOSE 50051

CMD ["node", "dist/src/main"]
