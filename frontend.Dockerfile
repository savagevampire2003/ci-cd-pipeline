# Multi-stage Dockerfile for Frontend with Nginx
# Stage 1: Build stage (if needed for future asset processing)
FROM node:18-alpine AS builder

WORKDIR /app

# Copy frontend files
COPY public/ ./public/

# Stage 2: Production stage with Nginx
FROM nginx:alpine

# Install envsubst for environment variable injection
RUN apk add --no-cache gettext

# Copy static files from builder
COPY --from=builder /app/public /usr/share/nginx/html

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a template for environment variable injection
COPY nginx-env.sh /docker-entrypoint.d/40-nginx-env.sh
RUN chmod +x /docker-entrypoint.d/40-nginx-env.sh

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health.html || exit 1

# Nginx will start automatically via the base image's entrypoint
