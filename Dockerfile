# Multi-stage build for optimized backend image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && \
    npm cache clean --force

# Production stage
FROM node:18-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy dependencies from builder stage with proper ownership
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application files with proper ownership
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs server.js ./
COPY --chown=nodejs:nodejs models ./models
COPY --chown=nodejs:nodejs routes ./routes
COPY --chown=nodejs:nodejs middleware ./middleware
COPY --chown=nodejs:nodejs public ./public

# Set environment variables
ENV PORT=3000 \
    NODE_ENV=production

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Add health check with proper error handling
HEALTHCHECK --interval=30s --timeout=3s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => process.exit(1));"

# Start application with dumb-init for proper signal handling
CMD ["dumb-init", "node", "server.js"]
