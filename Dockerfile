FROM node:26-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig*.json ./
RUN npm install --legacy-peer-deps

COPY shared ./shared
COPY src ./src
COPY public ./public
COPY middleware.ts ./
COPY next-env.d.ts ./
COPY next.config.mjs ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY components.json ./

ENV NODE_ENV=production
RUN npx next build

FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "server.js"]
