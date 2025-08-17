#!/bin/bash

# FreeDevTool.App Server Starter
# Usage: ./scripts/start-server.sh [PORT]
# Default port: 5000

PORT=${1:-5000}

echo "Starting FreeDevTool.App server on port $PORT..."

if command -v tsx >/dev/null 2>&1; then
    # Development mode with tsx
    NODE_ENV=development tsx server/index.ts --port=$PORT
elif [ -f "dist/index.js" ]; then
    # Production mode
    NODE_ENV=production node dist/index.js --port=$PORT
else
    echo "Error: Neither tsx is available nor production build found."
    echo "Please run 'npm install' for development or 'npm run build' for production."
    exit 1
fi