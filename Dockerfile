# Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Build args for provider configuration (must be set at build time for NEXT_PUBLIC vars)
ARG NEXT_PUBLIC_PROVIDER=claude
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000

# Set as environment variables for the build
ENV NEXT_PUBLIC_PROVIDER=$NEXT_PUBLIC_PROVIDER
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets (create public dir first in case it's empty)
RUN mkdir -p ./public
COPY --from=builder /app/public ./public/
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
