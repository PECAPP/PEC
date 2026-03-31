FROM node:22-alpine

WORKDIR /app

# Copy root and server manifests
COPY package*.json ./
COPY server/package*.json ./server/
COPY tsconfig*.json ./
COPY server/tsconfig*.json ./server/

# Copy shared directory
COPY shared ./shared

# Install dependencies at BOTH root and server level to ensure 
# shared schemas can resolve their own dependencies (like zod)
RUN npm install --legacy-peer-deps
WORKDIR /app/server
RUN npm install --legacy-peer-deps

# Copy the rest of the source code
WORKDIR /app
COPY server ./server

# Build
WORKDIR /app/server
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

CMD ["npm", "run", "start:dev"]
