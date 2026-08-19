# Multi-stage Dockerfile for GenOffice
# Stage 1: Build stage

FROM node:22-alpine AS builder

WORKDIR /app

# Install Rust toolchain for xlsx-engine sidecar
RUN apk add --no-cache rust cargo git python3 make g++

# Copy package files
COPY package*.json ./
COPY package-lock.json ./
COPY apps ./apps
COPY packages ./packages

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build all applications
RUN npm run build:all

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install runtime dependencies
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/packages ./packages

# Copy web server entry point
COPY docker/server.js ./server.js
COPY docker/docker-entrypoint.sh ./docker-entrypoint.sh

# Make entrypoint executable
RUN chmod +x ./docker-entrypoint.sh

# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app

USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]

# Development stage (optional)
FROM builder AS development

WORKDIR /app

# Expose dev ports
EXPOSE 3000 5173 5174 5175 5176 5177

# Start in development mode
CMD ["npm", "run", "dev"]
