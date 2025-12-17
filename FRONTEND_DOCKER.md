# Frontend Docker Setup

This document describes the frontend Docker configuration for the Student Management System.

## Files

- `frontend.Dockerfile` - Multi-stage Dockerfile for building the frontend with Nginx
- `nginx.conf` - Nginx configuration with SPA routing support
- `nginx-env.sh` - Script to inject environment variables at container startup

## Building the Frontend Image

```bash
docker build -f frontend.Dockerfile -t sms-frontend:latest .
```

## Running the Frontend Container

### Basic Usage

```bash
docker run -p 80:80 sms-frontend:latest
```

### With Environment Variables

```bash
docker run -p 80:80 \
  -e API_BASE_URL=http://backend:3000 \
  sms-frontend:latest
```

### With Docker Compose

```yaml
services:
  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    ports:
      - "80:80"
    environment:
      - API_BASE_URL=http://backend:3000
    depends_on:
      - backend
```

## Environment Variables

- `API_BASE_URL` - Backend API endpoint URL (default: `http://localhost:3000`)
  - This variable is injected into the frontend at container startup
  - The value is written to `/usr/share/nginx/html/config.js`
  - Frontend JavaScript can access it via `window.ENV.API_BASE_URL`

## Features

### SPA Routing
The Nginx configuration supports Single Page Application routing by falling back to `index.html` for all routes that don't match static files.

### Health Check
- Endpoint: `/health.html`
- Returns 200 OK when the frontend is serving correctly
- Used by Docker and Kubernetes for health monitoring

### Gzip Compression
Static assets are automatically compressed for faster delivery.

### Caching
Static assets (JS, CSS, images) are cached for 1 year with immutable cache headers.

### Security Headers
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block

## Nginx Configuration

The Nginx configuration (`nginx.conf`) includes:
- SPA routing with fallback to index.html
- Health check endpoint
- Gzip compression
- Static file caching
- Security headers
- Optional API proxy (commented out by default)

## Environment Variable Injection

The `nginx-env.sh` script runs automatically when the container starts and:
1. Reads the `API_BASE_URL` environment variable
2. Creates a `config.js` file in the web root
3. Makes the configuration available to frontend JavaScript via `window.ENV`

## Usage in Frontend Code

To use the injected API URL in your frontend code:

```javascript
// Load the config.js file in your HTML
<script src="/config.js"></script>

// Access the API URL in your JavaScript
const apiUrl = window.ENV?.API_BASE_URL || 'http://localhost:3000';

fetch(`${apiUrl}/api/students`)
  .then(response => response.json())
  .then(data => console.log(data));
```

## Health Check

The Docker health check runs every 30 seconds and verifies that Nginx is serving the health endpoint:

```bash
# Manual health check
curl http://localhost/health.html
```

## Troubleshooting

### Container won't start
- Check logs: `docker logs <container-id>`
- Verify Nginx configuration: `docker exec <container-id> nginx -t`

### Environment variables not working
- Check if config.js was created: `docker exec <container-id> cat /usr/share/nginx/html/config.js`
- Verify the nginx-env.sh script ran: `docker logs <container-id>`

### 404 errors on routes
- Ensure the Nginx SPA routing configuration is correct
- Check that `try_files $uri $uri/ /index.html;` is present in nginx.conf
