FROM node:25-alpine

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package*.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm install

# Copy only files needed by the frontend runtime/build
COPY shared ./shared
COPY src ./src
COPY public ./public
COPY middleware.ts ./
COPY next-env.d.ts ./
COPY next.config.mjs ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY components.json ./

# Expose Next.js port
EXPOSE 3000

# Run in Development mode to avoid strict production build checks as requested
CMD ["npm", "run", "frontend"]
