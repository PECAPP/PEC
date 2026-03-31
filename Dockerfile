FROM node:22-alpine

WORKDIR /app

# Copy root and shared
COPY package*.json ./
COPY tsconfig*.json ./
COPY shared ./shared

# Install all dependencies (frontend + dev tools)
RUN npm install --legacy-peer-deps

# Copy rest of the source
COPY . .

# Expose Next.js port
EXPOSE 3000

# Run in Development mode to avoid strict production build checks as requested
CMD ["npm", "run", "frontend"]
