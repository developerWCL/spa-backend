# ==================================
# SPA Backend (NestJS + TypeORM) - Dockerfile
# Multi-stage build for optimal image size
# ==================================

# Build stage
FROM node:25 AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install dependencies
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile; \
    else \
      npm i; \
    fi

# Copy application source
COPY . ./

# Build the application (includes entities and migrations in dist)
RUN npm run build

# Runtime stage
FROM node:25-alpine

WORKDIR /app

# Install dumb-init for proper signal handling, openssl for TLS, and curl for health checks
RUN apk add --no-cache dumb-init openssl curl

# Copy package files
COPY package.json package-lock.json* pnpm-lock.yaml* ./

# Install production dependencies only
RUN if [ -f pnpm-lock.yaml ]; then \
      npm install -g pnpm && pnpm install --frozen-lockfile --production; \
    else \
      npm ci --omit=dev; \
    fi

# Create application directories
RUN mkdir -p uploads logs

# Declare log directory as a volume so logs persist outside the container
VOLUME ["/app/logs"]

# Copy built application from builder (includes compiled migrations)
COPY --from=builder /app/dist ./dist

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]