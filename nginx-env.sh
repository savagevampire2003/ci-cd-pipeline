#!/bin/sh
# Script to inject environment variables into frontend JavaScript files
# This runs automatically when the container starts

set -e

# Default API URL if not provided
API_BASE_URL=${API_BASE_URL:-"http://localhost:3000"}

echo "Injecting environment variables into frontend..."
echo "API_BASE_URL: $API_BASE_URL"

# Create a config.js file with environment variables
cat > /usr/share/nginx/html/config.js <<EOF
// Auto-generated configuration file
// This file is created at container startup with environment variables
window.ENV = {
  API_BASE_URL: "${API_BASE_URL}"
};
EOF

echo "Environment variables injected successfully"
