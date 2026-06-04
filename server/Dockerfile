FROM node:20-alpine AS builder

WORKDIR /app

# Copy root and server manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY tsconfig*.json ./
COPY server/tsconfig*.json ./server/

# Copy shared directory
COPY shared ./shared

# Install dependencies at BOTH root and server level
RUN npm install --legacy-peer-deps
WORKDIR /app/server
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
WORKDIR /app
COPY server ./server

# Generate Prisma and Build NestJS
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app/server

ENV NODE_ENV=production

# Copy node modules and generated prisma client
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/server/node_modules /app/server/node_modules
COPY --from=builder /app/shared /app/shared

# Copy built dist and necessary package files
COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/server/package.json ./

# Switch to non-root user for security
USER node

EXPOSE 4000

CMD ["node", "dist/src/main"]
